<style lang="less">
  @import '../../assets/styles/common.less';
</style>

<template>
  <div class="alert-rule">
    <Row :gutter="16">
      <Col span="5">
        <label>报警ID:</label>
        <Input v-model="searchForm.alarmId" placeholder="报警ID" style="width: 200px"/>
      </Col>
      <Col span="5">
        <label>工程项目:</label>
        <Select v-model="searchForm.project" style="width: 200px">
            <Option v-for="item in projectList" :value="item.code" :key="item.code">{{ item.name }}</Option>
        </Select>
      </Col>
      <Col span="5">
        <label>报警KEY:</label>
        <Input v-model="searchForm.alarmKey" placeholder="报警Key" style="width: 200px"/>
      </Col>
      <Col span="4">
        <Button @click="getAlertRule" type="primary" style="margin-right: 10px">查询</Button>
        <Button @click="addLogModalFlag = true" type="success">新增</Button>
      </Col>
    </Row>
    <div>
        <Table :columns="columns" ref="selection" :data="ruleList" style="margin: 10px auto"></Table>
        <Page :total="totalListNum" show-sizer show-total @on-change="changePage" @on-page-size-change="changePageSize" :current.sync="current" style="float: right;"></Page>
    </div>
    <Modal
        v-model="addLogModalFlag"
        title="添加日志"
        @on-ok="addList"
        @on-cancel="addLogModalFlag = false">
        <Form :label-width="80">
          <FormItem label="规则名称">
            <Input v-model="addAlarmRuleForm.ruleName" placeholder="请输入规则名称"></Input>
          </FormItem>
          <FormItem label="工程项目">
            <Select v-model="addAlarmRuleForm.projectCode">
              <Option v-for="item in projectList" :value="item.code" :key="item.code">{{ item.name }}</Option>
            </Select>
          </FormItem>
          <FormItem label="es索引名称">
            <Input v-model="addAlarmRuleForm.ruleIndex" placeholder="请输入es索引名称"></Input>
          </FormItem>
          <FormItem label="告警类型">
            <Input v-model="addAlarmRuleForm.ruleType" placeholder="请输入告警类型"></Input>
          </FormItem>
          <FormItem label="通知方式">
            <CheckboxGroup v-model="addAlarmRuleForm.messageType" @on-change="chooseMessageType">
              <Checkbox label="短信" disabled></Checkbox>
              <Checkbox label="邮件"></Checkbox>
            </CheckboxGroup>
          </FormItem>
          <FormItem label="手机号码" v-if="smsAddrFlag">
            <Input v-model="addAlarmRuleForm.phoneNumber" placeholder="多个值之间用逗号分隔" disabled></Input>
          </FormItem>
          <FormItem label="邮箱地址" v-if="mailAddrFlag">
            <Input v-model="addAlarmRuleForm.mailAddr" placeholder="多个值之间用逗号分隔"></Input>
          </FormItem>
          <FormItem label="报警描述">
            <Input v-model="addAlarmRuleForm.alertDesc" placeholder="多个值之间用逗号分隔"></Input>
          </FormItem>
          <FormItem label="报警频率">
            <Input v-model="addAlarmRuleForm.timeFrameVal" style="width: 100px"></Input>
            <Select v-model="addAlarmRuleForm.timeFrameUnit" style="width: 100px">
                <Option value="min">分钟</Option>
                <Option value="hour">小时</Option>
            </Select>
            /
            <Input v-model="addAlarmRuleForm.numEvents" placeholder="请输入阈值" style="width: 100px"></Input>
            次
          </FormItem>
          <FormItem label="目标值">
            <Input v-model="addAlarmRuleForm.targetVal" placeholder=""></Input>
          </FormItem>
      </Form>
    </Modal>
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
      // data
      addAlarmRuleForm: {
        ruleName: '',
        ruleIndex: '',
        ruleType: '',
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
      // s
      searchForm: {
        alarmId: '',
        project: '',
        alarmKey: ''
      },
      projectList: [],
      ruleList: [],
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
          width: 200,
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
          width: 120,
          render: (h, params) => {
            return h(
              'div', [
                h('Button', {
                  props: {
                    type: params.row.status === 1 ? 'error' : 'primary',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.isUse(params.row)
                    }
                  }
                }, params.row.status === 1 ? '停用' : '启动'),
                h('Button', {
                  props: {
                    type: 'info',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.showRuleDetail(params.row.id)
                    }
                  }
                }, '查看')
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
      axios.post('portal/funcLog/updFuncionLog', {
        id: row.id,
        status: row.status
      }).then(result => {
        if (result.data.code === 0) {
          Message.success(result.data.msg)
          row.status = row.status === 1 ? 0 : 1
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
      let data = {};
      axios.get('alert/rule/queryList', data).then(result => {
        this.ruleList = result.data.data;
      })
    },
    // 增加
    addList () {
      let params = {
        projectFunctionId: this.projectFunctionId, // 项目工程id
        code: this.code, // 日志
        alarm: this.alarm, // 报警标识
        status: 0, // 状态
        level: this.level, // 日志级别
        text: this.logText + this.consoleParams // 日志描述+参数
      }
      axios.post('portal/funcLog/addFunctionLog', params).then(result => {
        if (result.data.code === 0) {
          Message.success(result.data.msg)
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
    changePage (index) {
      this.pageNum = index
      this.search()
    },
    changePageSize (index) {
      this.pageSize = index
      this.search()
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
</style>
