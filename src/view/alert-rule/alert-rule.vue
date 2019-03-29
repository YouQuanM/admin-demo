<style lang="less">
  @import '../../assets/styles/common.less';
</style>

<template>
  <div class="alert-rule">
    <Row :gutter="16">
      <Col span="5">
        <label>报警ID:</label>
        <Input v-model="searchForm.id" placeholder="报警ID" style="width: 200px" clearable/>
      </Col>
      <Col span="5">
        <label>工程项目:</label>
        <Select v-model="searchForm.projectCode" style="width: 200px" clearable>
            <Option v-for="item in projectList" :value="item.code" :key="item.code">{{ item.name }}</Option>
        </Select>
      </Col>
      <Col span="5">
        <label>报警KEY:</label>
        <Input v-model="searchForm.ruleName" placeholder="报警Key" style="width: 200px" clearable/>
      </Col>
      <Col span="4">
        <Button @click="getAlertRule" type="primary" style="margin-right: 10px">查询</Button>
        <Button @click="showAddModal" type="success">新增</Button>
      </Col>
    </Row>
    <div>
        <Table :columns="columns" ref="selection" :data="ruleList" style="margin: 10px auto"></Table>
        <Page :total="totalListNum" show-sizer show-total @on-change="changePage" @on-page-size-change="changePageSize" :current.sync="current" style="float: right;"></Page>
    </div>
    <Modal
        v-model="addLogModalFlag"
        :title="modalTitle"
        @on-ok="editFlag ? editAlarmRule() : addList()"
        @on-cancel="addLogModalFlag = false">
        <Form :label-width="80">
          <FormItem label="规则名称">
            <Input v-model="addAlarmRuleForm.ruleName" placeholder="请输入规则名称" :disabled="editFlag" :maxlength="80"></Input>
          </FormItem>
          <FormItem label="工程项目">
            <Select v-model="addAlarmRuleForm.projectCode" @on-change="chooseProject">
              <Option v-for="item in projectList" :value="item.code" :key="item.code">{{ item.name }}</Option>
            </Select>
          </FormItem>
          <!-- 这两条是默认值暂时不展示 -->
          <FormItem label="es索引名称" v-if="false">
            <Input v-model="addAlarmRuleForm.ruleIndex" placeholder="请输入es索引名称"></Input>
          </FormItem>
          <FormItem label="告警类型" v-if="false">
            <Input v-model="addAlarmRuleForm.ruleType" placeholder="请输入告警类型"></Input>
          </FormItem>
          <!-- 这两条是默认值暂时不展示 -->
          <FormItem label="通知方式">
            <CheckboxGroup v-model="addAlarmRuleForm.messageType" @on-change="chooseMessageType">
              <Checkbox label="短信" disabled></Checkbox>
              <Checkbox label="邮件"></Checkbox>
            </CheckboxGroup>
          </FormItem>
          <FormItem label="手机号码" v-if="smsAddrFlag">
            <Input v-model="addAlarmRuleForm.phoneNumber" placeholder="多个值之间用英文逗号分隔" disabled></Input>
          </FormItem>
          <FormItem label="邮箱地址" v-if="mailAddrFlag">
            <Input v-model="addAlarmRuleForm.mailAddr" placeholder="多个值之间用英文逗号分隔" :maxlength="500"></Input>
          </FormItem>
          <FormItem label="报警描述">
            <Input v-model="addAlarmRuleForm.alertDesc" placeholder="请输入报警描述" :maxlength="200"></Input>
          </FormItem>
          <FormItem label="报警频率">
            <Input v-model="addAlarmRuleForm.timeFrameVal" style="width: 50px"></Input>
            <Select v-model="addAlarmRuleForm.timeFrameUnit" style="width: 100px">
              <Option value="seconds">秒</Option>
              <Option value="minutes">分钟</Option>
              <Option value="hours">小时</Option>
            </Select>
            /
            <Input v-model="addAlarmRuleForm.numEvents" placeholder="请输入阈值" style="width: 50px"></Input>
            次
          </FormItem>
          <FormItem label="日志代号">
            <Select v-model="addAlarmRuleForm.targetVal" :disabled="projectCodeList.length === 0" filterable>
              <Option v-for="item in projectCodeList" :value="item" :key="item">{{ item }}</Option>
            </Select>
          </FormItem>
      </Form>
    </Modal>
    <Drawer :closable="false" width="400" v-model="showDeatilDrawer">
      <h2>{{detailData.ruleName}}</h2>
      <Divider />
      <div class="detail-drawer-text">
        <Row>
          <Col span="12">
              项目Code: {{detailData.projectCode}}
          </Col>
          <Col span="12">
              es索引名称: {{detailData.ruleIndex}}
          </Col>
        </Row>
        <Row>
          <Col span="12">
              操作人: {{detailData.operator}}
          </Col>
          <Col span="12">
              状态: <span v-if="detailData.status">启用</span><span v-if="!detailData.status">停用</span>
          </Col>
        </Row>
        <Row>
          <Col span="24">
              更新时间: {{detailData.updatedTime}}
          </Col>
        </Row>
        <Row>
          <Col span="24">
              报警描述: {{detailData.alertDesc}}
          </Col>
        </Row>
        <Divider />
        <Row>
          <Col span="12">
              通知方式: <span v-if="detailData.mailFlag === 0">邮件</span><span v-if="detailData.smsFlag === 0">短信</span>
          </Col>
        </Row>
        <Row>
          <Col span="24" v-if="detailData.mailFlag === 0">
              邮件地址:
              <p v-for="(item, index) in detailData.mailAddr.split(',')" :key="index">{{item}}</p>
          </Col>
        </Row>
        <Divider />
        <Row>
          <Col span="12">
              elastalert告警类型: {{detailData.ruleType}}
          </Col>
        </Row>
         <Row>
          <Col span="12">
              告警匹配值: {{detailData.targetVal}}
          </Col>
        </Row>
        <Row>
          <Col span="24">
              报警阈值: <span>{{detailData.timeFrameVal}}</span><span>{{detailData.timeFrameUnit}}</span>/<span>{{detailData.numEvents}}</span>次
          </Col>
        </Row>
      </div>
    </Drawer>
  </div>
</template>

<script>
import axios from '@/libs/axios-http'
import { Message } from 'iview'

export default {
  data () {
    return {
      // flag
      addLogModalFlag: false,
      smsAddrFlag: false,
      mailAddrFlag: false,
      editFlag: false,
      showDeatilDrawer: false,
      // data
      modalTitle: '',
      addAlarmRuleForm: {
        id: null,
        ruleName: '',
        ruleIndex: 'filebeat-*',
        ruleType: 'frequency',
        projectCode: '',
        messageType: [],
        mailflag: 1,
        smsFlag: 1,
        mailAddr: '',
        smsAddr: '',
        alertDesc: '',
        timeFrameVal: '',
        timeFrameUnit: '',
        numEvents: '',
        targetVal: ''
      },
      searchForm: {
        id: '',
        projectCode: '',
        ruleName: ''
      },
      projectList: [],
      ruleList: [],
      detailData: {},
      projectCodeList: [],
      columns: [
        {
          title: '规则ID',
          key: 'id',
          width: 100,
          align: 'center'
        },
        {
          title: '项目',
          key: 'projectCode',
          width: 120,
          align: 'center'
        },
        {
          title: '规则名称',
          key: 'ruleName',
          width: 120,
          align: 'center'
        },
        {
          title: '告警描述',
          key: 'alertDesc',
          align: 'center'
        },
        {
          title: '告警类型',
          key: 'ruleType',
          width: 120,
          align: 'center'
        },
        {
          title: '操作人',
          key: 'operator',
          width: 120,
          align: 'center'
        },
        {
          title: '通知方式',
          align: 'center',
          width: 120,
          render: (h, params) => {
            let alertFlag = []
            if (params.row.mailflag) {
              alertFlag.push(h('p', {}, '邮件'))
            }
            if (params.row.smsFlag) {
              alertFlag.push(h('p', {}, '短信'))
            }
            return h(
              'div', alertFlag
            )
          }
        },
        {
          title: '更新时间',
          key: 'updatedAt',
          width: 100,
          align: 'center'
        },
        {
          title: '操作',
          align: 'center',
          width: 180,
          render: (h, params) => {
            return h(
              'div', [
                h('Button', {
                  props: {
                    type: params.row.status === 0 ? 'error' : 'primary',
                    size: 'small'
                  },
                  style: {
                    'margin': '5px'
                  },
                  on: {
                    click: () => {
                      this.isUse(params.row)
                    }
                  }
                }, params.row.status === 0 ? '停用' : '启动'),
                h('Button', {
                  props: {
                    type: 'info',
                    size: 'small'
                  },
                  style: {
                    'margin': '5px'
                  },
                  on: {
                    click: () => {
                      this.showRuleDetail(params.row.id);
                    }
                  }
                }, '查看'),
                h('Button', {
                  props: {
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.showEditModal(params.row.id)
                    }
                  }
                }, '修改')
              ]
            )
          }
        }
      ],
      pageNum: 1,
      pageSize: 10,
      totalListNum: 0,
      current: 1
    }
  },
  created () {
    this.getProjectList()
    this.getAlertRule()
  },
  methods: {
    isUse (row) {
      axios.post('alert/rule/statusConfig', {
        id: row.id,
        status: row.status === 0 ? 1 : 0
      }).then(result => {
        if (result.data.code === 1) {
          Message.success(result.data.msg)
          this.getAlertRule()
        }
      })
    },
    // 获取工程项目列表
    getProjectList () {
      axios.get('cc/project/getList').then(result => {
        this.projectList = result.data.data ? result.data.data : []
      })
    },
    // 获取所有规则
    getAlertRule () {
      let data = {
        params: {
          id: this.searchForm.id,
          projectCode: this.searchForm.projectCode,
          ruleName: this.searchForm.ruleName,
          pageNum: this.pageNum,
          pageSize: this.pageSize
        }
      };
      axios.get('alert/rule/queryList', data).then(result => {
        this.ruleList = result.data.data.list;
        this.totalListNum = result.data.data.count;
      })
    },
    // 展示增加弹窗
    showAddModal () {
      this.addLogModalFlag = true;
      this.modalTitle = '增加规则';
      this.editFlag = false;
      this.smsAddrFlag = false;
      this.mailAddrFlag = false;
      this.projectCodeList = [];
      this.addAlarmRuleForm = {
        id: null,
        ruleName: '',
        ruleIndex: 'filebeat-*',
        ruleType: 'frequency',
        projectCode: '',
        messageType: [],
        mailflag: 1,
        smsFlag: 1,
        mailAddr: '',
        smsAddr: '',
        alertDesc: '',
        timeFrameVal: '',
        timeFrameUnit: '',
        numEvents: '',
        targetVal: ''
      }
    },
    // 增加
    addList () {
      let params = {
        ruleName: this.addAlarmRuleForm.ruleName,
        ruleIndex: this.addAlarmRuleForm.ruleIndex,
        ruleType: this.addAlarmRuleForm.ruleType,
        projectCode: this.addAlarmRuleForm.projectCode,
        mailFlag: this.addAlarmRuleForm.mailflag,
        mailAddr: this.addAlarmRuleForm.mailAddr,
        alertDesc: this.addAlarmRuleForm.alertDesc,
        timeFrameUnit: this.addAlarmRuleForm.timeFrameUnit,
        timeFrameVal: this.addAlarmRuleForm.timeFrameVal,
        numEvents: this.addAlarmRuleForm.numEvents,
        targetVal: this.addAlarmRuleForm.targetVal
      }
      axios.post('alert/rule/addConfig', params).then(result => {
        if (result.data.code === 1) {
          Message.success(result.data.msg);
          this.getAlertRule();
        }
      })
    },
    // 点击通知方式
    chooseMessageType (value) {
      this.mailAddrFlag = false;
      this.addAlarmRuleForm.mailflag = 1;
      if (value.includes('邮件')) {
        this.mailAddrFlag = true;
        this.addAlarmRuleForm.mailflag = 0;
      }
    },
    // 展示修改弹窗
    showEditModal (id) {
      this.addLogModalFlag = true;
      this.modalTitle = '修改规则';
      this.smsAddrFlag = false;
      this.mailAddrFlag = false;
      // 从详情接口请求详细数据
      axios.get('alert/rule/getDetail', {
        params: {
          id: id
        }
      }).then(result => {
        if (result.data.code === 1) {
          // 回显数据
          this.editFlag = true;
          let rule = result.data.data;
          this.addAlarmRuleForm = {
            id: rule.id,
            ruleName: rule.ruleName,
            projectCode: rule.projectCode,
            messageType: [],
            mailflag: rule.mailFlag,
            mailAddr: rule.mailAddr,
            smsAddr: rule.smsAddr, // 暂时不支持
            alertDesc: rule.alertDesc,
            timeFrameVal: rule.timeFrameVal,
            timeFrameUnit: rule.timeFrameUnit,
            numEvents: rule.numEvents,
            targetVal: rule.targetVal
          }
          if (rule.mailFlag === 0) {
            this.addAlarmRuleForm.messageType.push('邮件');
            this.mailAddrFlag = true;
          }
          if (rule.smsFlag === 0) {
            this.addAlarmRuleForm.messageType.push('短信');
            this.smsAddrFlag = true;
          }
          this.chooseProject(rule.projectCode)
        }
      })
    },
    // 保存修改
    editAlarmRule () {
      let data = {
        id: this.addAlarmRuleForm.id,
        mailFlag: this.addAlarmRuleForm.mailflag,
        smsFlag: 1,
        mailAddr: this.addAlarmRuleForm.mailAddr,
        alertDesc: this.addAlarmRuleForm.alertDesc,
        timeFrameVal: this.addAlarmRuleForm.timeFrameVal,
        timeFrameUnit: this.addAlarmRuleForm.timeFrameUnit,
        numEvents: this.addAlarmRuleForm.numEvents,
        targetVal: this.addAlarmRuleForm.targetVal
      }
      axios.post('alert/rule/updConfig', data).then(result => {
        if (result.data.code === 1) {
          Message.success(result.data.msg);
          this.getAlertRule();
        }
      })
    },
    // 查看详情
    showRuleDetail (id) {
      axios.get('alert/rule/getDetail', {
        params: {
          id: id
        }
      }).then(result => {
        this.detailData = result.data.data;
        this.detailData.updatedTime = this.detailData.updatedAt.join('-');
        this.showDeatilDrawer = true;
      })
    },
    // 选择项目后加载对应的log
    chooseProject (code) {
      if (code) {
        axios.get('cc/funcLog/getListByProjectCode', {
          params: {
            projectCode: code
          }
        }).then(result => {
          this.projectCodeList = result.data.data ? result.data.data : []
        })
      }
    },
    changePage (index) {
      this.pageNum = index
      this.getAlertRule()
    },
    changePageSize (index) {
      this.pageSize = index
      this.getAlertRule()
    }
  }
}
</script>

<style lang="less">
  .alert-rule {
  width: 100%;
  height: 100%;

  .ivu-col{
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin: 0 20px 20px 0;
    label {
      width: 35%;
      margin-right: 10px;
    }
    button {
      margin-right: 10px;
    }
  }
  .ivu-btn > .ivu-icon + span {
    margin: 0;
  }
}
.detail-drawer-text {
  font-size: 14px;
}
</style>
