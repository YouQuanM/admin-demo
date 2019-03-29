<style lang="less">
@import "../../assets/styles/common.less";
</style>

<template>
    <div class="home-main">
      <Row>
          <Button @click="showAddProject">添加项目</Button>
      </Row>
      <Divider />
      <Row>
        <Col span="7">
            <Card :bordered="false">
                <p slot="title">项目权限</p>
                <p v-for="(item, index) in projectList" :key="index" @click="showProject(item.code)">{{item.name}}</p>
            </Card>
        </Col>
      </Row>
      <Modal
        v-model="showProjectFlag"
        :title="projectForm.title"
        @on-ok="disposeProjectFun"
        @on-cancel="showProjectFlag = false"
        >
        <Form label-position="left" :label-width="100">
            <FormItem label="项目名称">
                <Input v-model="projectForm.name" :disabled="!addProjectFlag" placeholder="项目名称" maxlength="50"></Input>
            </FormItem>
            <FormItem label="项目编码">
                <Input v-model="projectForm.code" :disabled="!addProjectFlag" placeholder="项目编码" maxlength="50"></Input>
            </FormItem>
            <FormItem label="项目管理">
                <Input v-model="projectForm.owner" :disabled="!projectForm.isEdit" placeholder="项目管理" maxlength="200"></Input>
            </FormItem>
            <FormItem label="项目成员" v-if="!addProjectFlag">
                <Input v-model="projectForm.developer" :disabled="!projectForm.isEdit" maxlength="200"></Input>
            </FormItem>
            <FormItem label="创建时间" v-if="!addProjectFlag">
                <Input v-model="projectForm.created" disabled></Input>
            </FormItem>
            <FormItem label="项目描述">
                <Input v-model="projectForm.remark" placeholder="项目描述" :disabled="!projectForm.isEdit" maxlength="100"></Input>
            </FormItem>
        </Form>
    </Modal>
    </div>
</template>

<script>
import axios from '@/libs/axios-http'
import { Message } from 'iview'

export default {
  name: 'home',
  data () {
    return {
      // flag
      showProjectFlag: false,
      addProjectFlag: false,
      // data
      projectList: [],
      projectForm: {
        isEdit: false,
        title: '',
        name: '',
        code: '',
        owner: '',
        developer: '',
        created: '',
        remark: ''
      }
    }
  },
  created () {
    this.getProjectList()
  },
  methods: {
    //   首页获取所有项目列表
    getProjectList () {
      axios.get('/cc/project/getList').then((res) => {
        if (res.data.code === 1) {
          this.projectList = res.data.data
        }
      })
    },
    // 获取项目详情
    showProject (code) {
      axios.get('/cc/project/getMembers', {
        params: {
          projectCode: code
        }
      }).then((res) => {
        if (res.data.code === 1) {
          this.addProjectFlag = false;
          this.projectForm = {
            id: res.data.data.projectEntity.id,
            isEdit: res.data.data.projectEntity.isEdit === 1,
            title: res.data.data.projectEntity.name,
            name: res.data.data.projectEntity.name,
            code: res.data.data.projectEntity.code,
            owner: '',
            developer: '',
            created: res.data.data.projectEntity.created,
            remark: res.data.data.projectEntity.remark
          };
          res.data.data.membersList.forEach((v, i) => {
            if (v.role === 'MASTER') {
              this.projectForm.owner += v.uid + ',';
            } else if (v.role === 'DEVELOPER') {
              this.projectForm.developer += v.uid + ',';
            }
          });
          this.showProjectFlag = true;
        }
      })
    },
    // 添加项目
    showAddProject () {
      this.projectForm = {
        isEdit: true,
        title: '添加项目',
        name: '',
        code: '',
        owner: '',
        remark: '',
        developer: '',
        created: ''
      };
      this.showProjectFlag = true;
      this.addProjectFlag = true;
    },
    // 保存项目
    addProject () {
      axios.post('/cc/project/initProject', {
        name: this.projectForm.name,
        code: this.projectForm.code,
        remark: this.projectForm.remark,
        owners: this.projectForm.owner
      }).then(res => {
        if (res.data.code === 1) {
          Message.success(result.data.msg);
          this.getProjectList();
        }
      })
    },
    // 更新项目
    updateProject () {
      axios.post('cc/project/updProjectInfo', {
        name: this.projectForm.name,
        code: this.projectForm.code,
        remark: this.projectForm.remark,
        owners: this.projectForm.owner,
        members: this.projectForm.developer
      }).then(res => {
        if (res.data.code === 1) {
          Message.success(result.data.msg);
          this.getProjectList();
        }
      })
    },
    // 处理添加或修改或不处理
    disposeProjectFun () {
      if (this.addProjectFlag) {
        this.addProject();
      } else if (this.projectForm.isEdit) {
        this.updateProject()
      } else {
        //  成员查看时不处理
      }
    }
  }
}
</script>

<style lang="less">
.avator-img{
    display: block;
    width: 80%;
    max-width: 100px;
    height: auto;
}
.card-user-infor-name{
    font-size: 2em;
    color: #2d8cf0;
}
.card-title{
    color: #abafbd;
}
.made-child-con-middle{
    height: 100%;
}
.to-do-list-con{
    height: 145px;
    overflow: auto;
}
.to-do-item{
    padding: 2px;
}
.infor-card-con{
    height: 100px;
}
.infor-card-icon-con{
    height: 100%;
    color: white;
    border-radius: 3px 0 0 3px;
}
.map-con{
    height: 305px;
}
.map-incon{
    height: 100%;
}
.data-source-row{
    height: 200px;
}
.line-chart-con{
    height: 150px;
}
</style>
