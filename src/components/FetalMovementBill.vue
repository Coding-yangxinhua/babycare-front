<template>
  <div>
    <van-row>
        <van-divider >历史胎动 <router-link to="/"><van-icon name="exchange" /></router-link></van-divider>
    </van-row>
    <van-icon name="calendar-o" @click="showSelectDate = true"/>
    <van-calendar v-model="showSelectDate" :min-date="minDate" :max-date="maxDate" type="range" @confirm="selectDate" />

    <van-row class="todayFetal">

      <div class="plan_box">
        <table>
            <thead>
                <td class="head" style="width: 204px;">日期</td>
                <td class="head" style="width: 176px;">早</td>
                <td class="head" style="width: 190px;">中</td>
                <td class="head" style="width: 190px;">晚</td>

            </thead>
            <tbody>
                <tr v-for="(value, key) in historyFetalRecords" :key="key">
                    <td>{{ value.date }}</td>
                    <td>{{ record(value.dataList, 0) }}</td>
                    <td>{{ record(value.dataList, 1) }}</td>
                    <td>{{ record(value.dataList, 2) }}</td>

                </tr>
            </tbody>
          </table>
      </div>
      <div v-if="historyFetalRecords == null || historyFetalRecords.length == 0">
              <van-divider>暂无历史数据</van-divider>
      </div>
    </van-row>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'FetalMovement',
  created() {
    // 获取今日填写的数据
    this.searchRecords()
  },
  computed: {
    record: function() {
      return (data, index) => {
        let time = [0, 12, 18, 24]
        const item = data.filter(i => {
          console.log(new Date(i.startTime).getHours())
          console.log(time[index] <= new Date(i.startTime).getHours() && new Date(i.startTime).getHours() < time[index + 1])
          return time[index] <= new Date(i.startTime).getHours() && new Date(i.startTime).getHours() < time[index + 1]
        } )[0]
        return item? item.validCount : 0
      }
      
    }
  },
  data() {
    return {
      historyFetalRecords: [],
      showSelectDate: false,
      minDate: new Date(),
      maxDate: new Date(),
      pageNo: 1,
      pageSize: 30,
    }
  },
  methods: {
    async searchRecords() {
      const resp = await axios.get(`http://localhost:520/babycare/fetalMovement/search`)
      const data = this.historyFetalRecords = resp.data.result
      this.maxDate = data.length > 0? new Date(data[0].date) : new Date()
      this.minDate = data.length > 0? new Date(data[data.length - 1].date) : new Date()
      
    },
    selectDate () {

    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.box {
  margin: 10px 10px;
}
.todayFetal{
  margin-top: 20px;
}
.colon {
  display: inline-block;
  margin: 0 4px;
  color: #7cee0a98;
}

.block {
  border-radius: 5px 5px 5px 5px;
  font-size: 24px;
  line-height: 36px;
  display: inline-block;
  width: 36px;
  height: 36px;
  color: #fff;
  text-align: center;
  background-color: #7cee0a98;
}

.plan_box {
  overflow: hidden;
}
.plan_box table {
  border-spacing: 0;
}
.plan_box table thead tr:nth-child(2n+1) {
  background-color: #FAFAFA;
}
.plan_box table tr {
  height: 40px;
  font-size: 14px;
  color: #666666;
  line-height: 14px;
  font-weight: 400;
}
.plan_box table tr:nth-child(2n) {
  background-color: #FAFAFA;
}

.plan_box table .head {
  font-size: 15px;
  color: #666666;
  line-height: 15px;
  font-weight: 600;
  height: 40px;
  background-color: #FAFAFA; 
}
</style>
