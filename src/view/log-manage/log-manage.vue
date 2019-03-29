<style lang="less">
@import "../../assets/styles/common.less";
</style>

<template>
  <div class="log-manage" >
    <Row>
      <Col span="5">
        <label>工程项目：</label>
        <Select v-model="searchLogForm.projectCode" clearable placeholder="请选择工程项目">
            <Option v-for="item in projectList" :value="item.code" :key="item.code">{{ item.name }}</Option>
        </Select>
      </Col>
      <Col span="5">
        <label>编码：</label>
        <Input v-model="searchLogForm.Code" clearable placeholder="请输入日志编码"/>
      </Col>
      <Col span="5">
        <label>日志描述：</label>
        <Input v-model="searchLogForm.Text" clearable placeholder="请输入日志描述" />
      </Col>
      <Col span="5">
        <Button @click="showAddLog" type="success">新增</Button>
      </Col>
    </Row>
    <Row>
      <Col span="5">
        <label>是否报警：</label>
        <Select v-model="searchLogForm.alarm" placeholder="是否报警" clearable>
            <Option value="Y">报警</Option>
            <Option value="N">不报警</Option>
        </Select>
      </Col>
      <Col span="5">
        <label>日志级别：</label>
        <Select v-model="searchLogForm.Level" placeholder="日志级别" clearable>
            <Option v-for="(item,index) in levelList" :value="item" :key="index">{{ item }}</Option>
        </Select>
      </Col>
      <Col span="5">
        <label>是否启用：</label>
        <Select v-model="searchLogForm.Status" placeholder="是否启用" clearable>
            <Option value="0">启用</Option>
            <Option value="1">不启用</Option>
        </Select>
      </Col>
      <Col span="3" style="margin-right: 0px;">
        <Button @click="getLogList" type="primary">查询</Button>
        <Button @click="clearSearch">清空</Button>
      </Col>
    </Row>
    <div>
        <Table :columns="columns" ref="selection" :data="logList" style="margin: 10px auto"></Table>
        <Page :total="totalListNum" show-sizer show-total @on-change="changePage" @on-page-size-change="changePageSize" :current.sync="current" style="float: right;"></Page>
    </div>
    <Modal
        v-model="addLogModalFlag"
        :title="modalTitle"
        @on-ok="modalTitle === '新增日志' ? addList() : saveEditLog()"
        @on-cancel="addLogModalFlag = false">
        <Form :label-width="80">
          <FormItem label="项目">
              <Select v-model="addLogForm.projectCode">
                <Option v-for="item in projectList" :value="item.code" :key="item.code">{{ item.name }}</Option>
              </Select>
          </FormItem>
          <FormItem label="编码">
            <Input v-model="addLogForm.Code" placeholder="请输入编码" maxlength="100"></Input>
          </FormItem>
          <FormItem label="状态">
            <i-switch v-model="addLogForm.Status">
                <Icon type="md-checkmark" slot="open"></Icon>
                <Icon type="md-close" slot="close"></Icon>
            </i-switch>
          </FormItem>
          <FormItem label="日志级别">
              <Select v-model="addLogForm.Level">
                  <Option value="INFO">INFO</Option>
                  <Option value="DEBUG">DEBUG</Option>
                  <Option value="WARN">WARN</Option>
                  <Option value="ERROR">ERROR</Option>
              </Select>
          </FormItem>
          <FormItem label="日志信息">
            <Input v-model="addLogForm.Text" placeholder="请输入日志信息" maxlength="200"></Input>
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
      // data
      modalTitle: '',
      addLogForm: { // 增加和修改日志信息的数据
        ID: '',
        Code: '',
        alarm: false,
        Status: false,
        Level: '',
        projectCode: '',
        Text: ''
      },
      searchLogForm: { // 查询条件
        projectCode: '',
        Code: '',
        alarm: null,
        Status: null,
        Level: '',
        Text: ''
      },
      projectList: [], // 所有项目数据
      levelList: ['DEBUG', 'INFO', 'WARN', 'ERROR'],
      logList: [], // 所有日志数据
      columns: [
        {
          title: '日志ID',
          key: 'id',
          width: 200,
          align: 'center'
        },
        {
          title: '日志代号',
          key: 'code',
          align: 'center'
        },
        {
          title: '日志信息',
          key: 'text',
          align: 'center'
        },
        {
          title: '日志级别',
          key: 'level',
          align: 'center'
        },
        {
          title: '操作人',
          key: 'operator',
          align: 'center'
        },
        {
          title: '更新时间',
          key: 'updated',
          align: 'center'
        },
        {
          title: '操作',
          align: 'center',
          width: 150,
          render: (h, params) => {
            return h(
              'div', [
                h(
                  'Button',
                  {
                    props: {
                      type: params.row.status === 0 ? 'error' : 'primary',
                      size: 'small'
                    },
                    style: {
                      'margin-right': '5px'
                    },
                    on: {
                      click: () => {
                        this.isUse(params.row)
                      }
                    }
                  },
                  params.row.status === 0 ? '停用' : '启动'
                ),
                h(
                  'Button',
                  {
                    props: {
                      size: 'small'
                    },
                    style: {
                      'margin-right': '5px'
                    },
                    on: {
                      click: () => {
                        this.editLog(params.row)
                      }
                    }
                  },
                  '修改'
                )
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
    this.getLogList()
  },
  methods: {
    isUse (row) {
      axios
        .post('cc/funcLog/updFuncionLog', {
          id: row.id,
          status: row.status === 0 ? 1 : 0
        })
        .then(result => {
          if (result.data.code === 1) {
            Message.success(result.data.msg)
            this.getLogList()
          }
        })
    },
    // 获取工程项目列表
    getProjectList () {
      axios.get('/cc/project/getList').then(result => {
        this.projectList = result.data.data ? result.data.data : []
      })
    },
    // 获取日志列表
    getLogList () {
      let data = { // 查询条件
        params: {
          projectCode: this.searchLogForm.projectCode,
          Code: this.searchLogForm.Code,
          alarm: this.searchLogForm.alarm,
          Status: this.searchLogForm.Status,
          Level: this.searchLogForm.Level,
          Text: this.searchLogForm.Text,
          pageNum: this.pageNum,
          pageSize: this.pageSize
        }
      }
      axios.get('/cc/funcLog/getList', data).then(result => {
        this.logList = result.data.data.list;
        this.totalListNum = result.data.data.count;
      })
    },
    // 展示增加弹窗
    showAddLog () {
      this.modalTitle = '新增日志';
      this.addLogForm = {
        ID: '',
        Code: '',
        alarm: false,
        Status: false,
        Level: '',
        projectCode: '',
        Text: ''
      }
      this.addLogModalFlag = true;
    },
    // 增加
    addList () {
      let params = {
        projectCode: this.addLogForm.projectCode, // 项目工程id
        code: this.addLogForm.Code, // 日志
        alarm: this.addLogForm.alarm ? 'Y' : 'N', // 报警标识
        status: this.addLogForm.Status ? 0 : 1, // 状态
        level: this.addLogForm.Level, // 日志级别
        text: this.addLogForm.Text// 日志描述+参数
      }
      axios.post('/cc/funcLog/addFunctionLog', params).then(result => {
        if (result.data.code === 1) {
          Message.success(result.data.msg)
          this.getLogList()
        } else {
          Message.warning(result.data.msg)
        }
      })
    },
    // 展示修改弹窗
    editLog (row) {
      this.addLogForm = {
        id: row.id,
        Code: row.code,
        alarm: row.alarm === 'Y',
        Status: row.status === 0,
        Level: row.level,
        projectCode: row.projectCode,
        Text: row.text
      };
      this.modalTitle = '修改日志';
      this.addLogModalFlag = true;
    },
    // 修改
    saveEditLog () {
      let data = {
        id: this.addLogForm.id,
        projectCode: this.addLogForm.projectCode, // 项目工程id
        code: this.addLogForm.Code, // 日志
        alarm: this.addLogForm.alarm ? 'Y' : 'N', // 报警标识
        status: this.addLogForm.Status ? 0 : 1, // 状态
        level: this.addLogForm.Level, // 日志级别
        text: this.addLogForm.Text// 日志描述+参数
      };
      axios.post('/cc/funcLog/updFuncionLog', data).then(result => {
        if (result.data.code === 1) {
          Message.success(result.data.msg)
          this.getLogList()
        } else {
          Message.warning(result.data.msg)
        }
      })
    },
    // 清空
    clearSearch () {
      this.searchLogForm = {
        projectCode: '',
        Code: '',
        alarm: null,
        Status: null,
        Level: '',
        Text: ''
      }
    },
    changePage (index) {
      this.pageNum = index
      this.getLogList()
    },
    changePageSize (index) {
      this.pageSize = index
      this.getLogList()
    }
  }
}
</script>

<style lang="less">
  .log-manage {
  width: 100%;
  height: 100%;

  .ivu-col{
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin: 0 20px 20px 0;
    label {
      width: 42%;
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
