<style lang="less">
  @import '../../styles/common.less';
  @import './err-manage.less';
</style>

<template>
  <div class="err-manage" >
    <Row :gutter="16">
      <Col span="5">
        <label>工程项目：</label>
        <Select v-model="projectFunctionId" clearable placeholder="请选择工程项目">
            <Option v-for="item in projectList" :value="item.id" :key="item.id">{{ item.taskCode }}</Option>
        </Select>
      </Col>
      <Col span="5">
        <label>日志代号：</label>
        <Input v-model="code" clearable placeholder="请输入日志代号"/>
      </Col>
      <!--<Col span="5">
        <label>项目分支：</label>
        <Select v-model="status" clearable placeholder="请选择项目分支">
            <Option v-for="item in statusList" :value="item.label" :key="item.value">{{ item.label }}</Option>
        </Select>
      </Col>-->
    </Row>
    <Row :gutter="16">
      <Col span="5">
        <label>错误描述：</label>
        <Input v-model="errText" clearable placeholder="请输入错误描述" />
      </Col>
      <Col span="5">
        <label>输出参数：</label>
        <Input v-model="consoleParams" clearable placeholder="请输入输出参数" />
      </Col>
      <Col span="4">
        <label>报&nbsp;&nbsp;警：</label>
        <Select v-model="alarm" placeholder="是否报警" clearable>
            <Option v-for="item in alarmList" :value="item.val" :key="item.val">{{ item.label }}</Option>
        </Select>
      </Col>
      <Col span="4">
        <Button @click="search" type="primary">查询</Button>
        <Button @click="addList" type="primary">新增</Button>
      </Col>
    </Row>
    <div>
        <Table :columns="columns" ref="selection" :data="errList" style="margin: 10px auto"></Table>
        <Page :total="totalListNum" show-sizer show-total @on-change="changePage" @on-page-size-change="changePageSize" :current.sync="current" style="float: right;"></Page>
    </div>
  </div>
</template>

<script>
import axios from '@/libs/axios-http'
import { Message } from 'iview'

export default {
  data () {
    return {
      projectFunctionId: 0, // 项目工程
      projectList: [],
      status: '', // 项目分支
      statusList: [],
      code: '', // 日志代号
      errText: '', // 日志描述
      consoleParams: '', // 输出参数
      level: '', // 日志级别
      levelList: ['DEBUG', 'INFO', 'WARN', 'ERROR'],
      alarm: '',
      alarmList: [
        {val: 'Y', label: '是'},
        {val: 'N', label: '否'}
      ],
      errList: [],
      columns: [
        {
          title: '错误ID',
          key: 'projectFunctionId',
          width: 200,
          align: 'center'
        },
        {
          title: '错误代号',
          key: 'code',
          align: 'center'
        },
        {
          title: '错误信息',
          key: 'text',
          align: 'center'
        },
        {
          title: '添加人',
          key: 'billNum',
          align: 'center'
        },
        {
          title: '添加时间',
          key: 'updated',
          align: 'center'
        },
        {
          title: '操作',
          align: 'center',
          width: 120,
          render: (h, params) => {
            return h('Button', {
              props: {
                type: params.row.status === 1 ? 'error' : 'primary',
                size: 'small'
              },
              on: {
                click: () => {
                  this.isUse(params.row)
                }
              }
            }, params.row.status === 1 ? '停用' : '启动')
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
  },
  methods: {
    isUse (row) {
      axios.post('portal/funcErr/updFuncionErr', {
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
      axios.post('portal/pfunc/projectList', {
        configurationCode: 'ERR'
      }).then(result => {
        this.projectList = result.data.data ? result.data.data : []
      })
    },
    // 查询项目错误码列表
    search () {
      let params = {
        projectFunctionId: this.projectFunctionId, // 项目工程id
        code: this.code, // 错误
        text: this.errText, // 错误描述+参数
        alarm: this.alarm,
        pageNum: this.pageNum,
        pageSize: this.pageSize
      }
      axios.post('portal/funcErr/getList', params).then(result => {
        this.errList = result.data.data ? result.data.data : []
      })
    },
    // 增加
    addList () {
      let params = {
        projectFunctionId: this.projectFunctionId, // 项目工程id
        code: this.code,
        alarm: this.alarm,
        status: 0, // 状态
        text: this.errText + this.consoleParams // 错误描述+参数
      }
      axios.post('portal/funcErr/addFunctionErr', params).then(result => {
        if (result.data.code === 0) {
          Message.success(result.data.msg)
        }
      })
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
