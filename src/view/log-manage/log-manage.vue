<style>
  @import '../../styles/common.less';
  @import './log-manage.less';
</style>

<template>
  <div class="log-manage">
    <Row :gutter="16">
      <Col span="5">
        <Select v-model="chooseCity" clearable placeholder="选择城市">
            <Option v-for="item in cityList" :value="item.label" :key="item.value">{{ item.label }}</Option>
        </Select>
      </Col>
      <Col span="5">
        <DatePicker type="month" placeholder="请选择月份" :value="chooseTime" v-model="chooseTime" :options="options"></DatePicker>
      </Col>
      <Col span="5">
        <Select v-model="supplierIdName" placeholder="供应商名称" filterable clearable>
            <Option v-for="(item, index) in supplierNameList" :value="item.id" :key="index">{{ item.dicDetailName }}</Option>
        </Select>
      </Col>
      <Col span="5">
        <Select v-model="supplierType" placeholder="供应商类别" clearable>
            <Option v-for="item in supplierTypeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
      </Col>
      <Col span="4">
        <Button @click="search(0)" type="primary">查询</Button>
      </Col>
    </Row>
    <div class="tablelist">
        <Table :columns="columns" ref="selection" :data="data" style="margin: 10px auto"></Table>
        <Page :total="totalListNum" show-sizer show-total @on-change="changePage" @on-page-size-change="changePageSize" :current.sync="current" style="float: right;"></Page>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  data () {
    return {
      chooseCity: '',
      chooseTime: '',
      TimeFormat: '',
      supplierIdName: '', // 供应商名称
      supplierType: '', // 供应商类别
      supplierNameList: [],
      cityList: [],
      supplierTypeList: [
        {value: 'mo', label: '实物类供应商'},
        {value: 'service', label: '服务类供应商'},
        {value: 'dc', label: '直供类供应商'}
      ],
      columns: [
        {
          title: '序号',
          key: 'id',
          width: 60,
          align: 'center'
        },
        {
          title: '账单月份',
          key: 'accountingYearMonth',
          align: 'center'
        },
        {
          title: '城市',
          key: 'cityName',
          align: 'center'
        },
        {
          title: '账单总数量',
          key: 'billNum',
          align: 'center'
        },
        {
          title: '已确认数量',
          key: 'confirmTrue',
          align: 'center'
        },
        {
          title: '未确认数量',
          key: 'confirmFalse',
          align: 'center'
        },
        {
          title: '供应商名称',
          key: 'vendorName',
          align: 'center'
        },
        {
          title: '供应类型',
          key: 'vendorType',
          align: 'center'
        }
      ],
      options: {
        // 设置近三个月日期可选
        disabledDate (date) {
          let Lastdate = new Date()
          Lastdate.setMonth(Lastdate.getMonth() - 2, 0)
          return (date && date.valueOf() > Date.now()) || (date && date.valueOf() < Lastdate)
        }
      },
      data: [],
      pageNum: 1,
      pageSize: 10,
      totalListNum: 0,
      current: 1
    }
  },
  methods: {

  }
}
</script>
