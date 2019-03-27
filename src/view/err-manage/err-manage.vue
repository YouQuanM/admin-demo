<style lang="less">
@import "../../assets/styles/common.less";
</style>

<template>
  <div class="err-manage">
    <Row :gutter="16">
      <Col span="5">
        <label>工程项目：</label>
        <Select v-model="searchForm.projectCode" clearable placeholder="请选择工程项目">
          <Option v-for="item in projectList" :value="item.code" :key="item.code">{{ item.name }}</Option>
        </Select>
      </Col>
      <Col span="5">
        <label>错误code：</label>
        <Input v-model="searchForm.code" clearable placeholder="请输入错误code"/>
      </Col>
      <Col span="4"></Col>
      <Col span="4">
        <Button @click="showAddModal" type="success">新增</Button>
      </Col>
    </Row>
    <Row :gutter="16">
      <Col span="5">
        <label>错误描述：</label>
        <Input v-model="searchForm.text" clearable placeholder="请输入错误描述"/>
      </Col>
      <Col span="5">
        <label>是否启用：</label>
        <Select v-model="searchForm.status" placeholder="是否启用" clearable>
            <Option value="0">启用</Option>
            <Option value="1">不启用</Option>
        </Select>
      </Col>
      <Col span="4"></Col>
      <Col span="4">
        <Button @click="getErrList" type="primary">查询</Button>
        <Button @click="clearSearch">清空</Button>
      </Col>
    </Row>
    <div>
      <Table :columns="columns" ref="selection" :data="errList" style="margin: 10px auto"></Table>
      <Page
        :total="totalListNum"
        show-sizer
        show-total
        @on-change="changePage"
        @on-page-size-change="changePageSize"
        :current.sync="current"
        style="float: right;"
      ></Page>
    </div>
    <Modal
        v-model="errModalFlag"
        :title="modalTitle"
        @on-ok="modalTitle === '新增错误码' ? addList() : saveEditErr()"
        @on-cancel="errModalFlag = false">
        <Form :label-width="80">
          <FormItem label="项目">
            <Select v-model="addErrForm.projectCode">
              <Option v-for="item in projectList" :value="item.code" :key="item.code">{{ item.name }}</Option>
            </Select>
          </FormItem>
          <FormItem label="编码">
            <Input v-model="addErrForm.code" placeholder="请输入编码"></Input>
          </FormItem>
          <FormItem label="状态">
            <i-switch v-model="addErrForm.status">
                <Icon type="md-checkmark" slot="open"></Icon>
                <Icon type="md-close" slot="close"></Icon>
            </i-switch>
          </FormItem>
          <FormItem label="错误描述">
            <Input v-model="addErrForm.text" placeholder="请输入错误描述"></Input>
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
      errModalFlag: false,
      // data
      searchForm: {
        projectCode: '',
        code: '',
        status: null,
        text: ''
      },
      addErrForm: {
        id: '',
        projectCode: '',
        code: '',
        status: '',
        text: ''
      },
      modalTitle: '',
      projectList: [],
      errList: [],
      columns: [
        {
          title: '错误ID',
          key: 'id',
          width: 200,
          align: 'center'
        },
        {
          title: '错误代号',
          key: 'code',
          align: 'center'
        },
        {
          title: '错误描述',
          key: 'text',
          align: 'center'
        },
        {
          title: '操作人',
          key: 'operator',
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
          width: 150,
          render: (h, params) => {
            return h(
              'div', [
                h(
                  'Button',
                  {
                    props: {
                      type: params.row.status === 1 ? 'error' : 'primary',
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
                  params.row.status === 1 ? '停用' : '启动'
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
                        this.showEditModal(params.row)
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
    this.getErrList()
  },
  methods: {
    isUse (row) {
      axios
        .post('cc/funcErr/updFuncionErr', {
          id: row.id,
          status: row.status === 0 ? 1 : 0
        })
        .then(result => {
          if (result.data.code === 1) {
            Message.success(result.data.msg)
            this.getErrList()
          }
        })
    },
    // 获取工程项目列表
    getProjectList () {
      axios.get('/cc/project/getList').then(result => {
        this.projectList = result.data.data ? result.data.data : []
      })
    },
    // 查询项目错误码列表
    getErrList () {
      let data = {
        params: {
          projectCode: this.searchForm.projectCode, // 项目工程id
          code: this.searchForm.code, // 错误
          text: this.searchForm.text, // 错误描述
          status: this.searchForm.status,
          pageNum: this.pageNum,
          pageSize: this.pageSize
        }
      }
      axios.get('/cc/funcErr/getList', data).then(result => {
        this.errList = result.data.data ? result.data.data : []
      })
    },
    // 显示增加弹窗
    showAddModal () {
      this.errModalFlag = true;
      this.modalTitle = '新增错误码';
    },
    // 增加
    addList () {
      let params = {
        projectCode: this.addErrForm.projectCode, // 项目工程id
        code: this.addErrForm.code,
        status: this.addErrForm.status ? 0 : 1, // 状态
        text: this.addErrForm.text // 错误描述
      }
      axios.post('cc/funcErr/addFunctionErr', params).then(result => {
        if (result.data.code === 1) {
          Message.success(result.data.msg)
        }
      })
    },
    // 显示修改弹窗
    showEditModal (row) {
      this.addErrForm = {
        id: row.id,
        projectCode: row.projectCode,
        code: row.code,
        status: row.status === 1,
        text: row.text
      }
      this.modalTitle = '修改错误码';
      this.errModalFlag = true;
    },
    // 保存修改
    saveEditErr () {
      let data = {
        id: this.addErrForm.id, // 错误id
        projectCode: this.addErrForm.projectCode, // 项目工程id
        code: this.addErrForm.Code, // 错误code
        status: this.addErrForm.Status ? 0 : 1, // 状态
        text: this.addErrForm.Text// 错误描述
      };
      axios.post('cc/funcErr/updFuncionErr', data).then(result => {
        if (result.data.code === 1) {
          Message.success(result.data.msg)
          this.getErrList()
        } else {
          Message.warning(result.data.msg)
        }
      })
    },
    // 清空搜索
    clearSearch () {
      this.searchForm = {
        projectCode: '',
        code: '',
        status: null,
        text: ''
      }
    },
    changePage (index) {
      this.pageNum = index
      this.getErrList()
    },
    changePageSize (index) {
      this.pageSize = index
      this.getErrList()
    }
  }
}
</script>

<style lang="less">
.err-manage {
  width: 100%;
  height: 100%;

  .ivu-col{
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin: 0 20px 20px 0;
    label {
      width: 45%;
      margin-right: 10px;
    }
    button {
      margin-right: 10px;
    }
  }
  .checkBox {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      label {
        width: 100%;
        padding-top: 5px;
        font-size: 15px;
      }
  }
  .ivu-btn > .ivu-icon + span {
    margin: 0;
  }
}
</style>
