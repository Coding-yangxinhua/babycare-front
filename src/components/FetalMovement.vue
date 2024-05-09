<template>
  <div>
    <van-row class="title">
        <van-col span="24">
          <h2>我们一起数胎动</h2>
        </van-col>
    </van-row>
    <van-row class="fetalmovement">
      <van-cell-group>
        <van-cell title="有效次数" :value="fetalInfo.validCount" />
        <van-cell title="总次数" :value="fetalInfo.totalCount" />
      </van-cell-group>
      <van-count-down class="box" :auto-start="false" ref="countDown" :time="remainingTime" @finish="endCounting">
        <template #default="timeData">
          <span class="block">{{ timeData.minutes.toString().padStart(2, '0') }}</span>
          <span class="colon">:</span>
          <span class="block">{{ timeData.seconds.toString().padStart(2, '0') }}</span>
        </template>
      </van-count-down>
      <van-grid :column-num="3" clickable>
        <van-grid-item text="开始计时" icon="play-circle-o" @click="startTimer(false)" />
        <van-grid-item text="动一下，点一下" icon="like" @click="count" />
        <van-grid-item text="结束计时" icon="stop-circle-o" @click="preEndCounting" />
      </van-grid>
    </van-row>
    <van-row class="todayFetal">
      <van-row>
        <van-divider >今日胎动 <router-link to="/bill"><van-icon name="exchange" /></router-link></van-divider>
      </van-row>
      <div class="plan_box">
        <table>
            <thead>
                <td class="head" style="width: 204px;">时间</td>
                <td class="head" style="width: 176px;">有效次数</td>
                <td class="head" style="width: 190px;">总次数</td>
            </thead>
            <tbody>
                <tr v-for="record in todayFetalRecords" :key="record.id">
                    <td>{{ timeSlot(record.gmtCreate) }}</td>
                    <td>{{ record.validCount }}</td>
                    <td>{{ record.totalCount }}</td>
                </tr>
            </tbody>
          </table>
      </div>
      <div v-if="todayFetalRecords == null || todayFetalRecords.length == 0">
              <van-divider>今天还没开始哦</van-divider>
      </div>
    </van-row>
  </div>
</template>

<script>

import { Dialog, Notify } from 'vant'
import api from '../api/api'
export default {
  name: 'FetalMovement',
  created() {
    // 获得已有的日期
    let localStartTime = localStorage.getItem("startTime")
    // 并不存在开始时间，直接返回
    if (localStartTime == null) {
      return
    }
    let overTime = new Date().getTime() - localStartTime
    // 如果当前时间没超过已有日期一小时，则读取旧数据
    if (localStartTime != null && overTime < 3600000) {
      this.isTimerRunning = true
      this.fetalInfo = JSON.parse(localStorage.getItem("info"))
      this.remainingTime = 3600000 - overTime
    }
    // 获取今日填写的数据
    this.getTodayFetal()
  },
  mounted() {
    console.log(process.env.VUE_APP_BASE_URL, "生产环境VUE_APP_URL");
    if (this.isTimerRunning) {
      this.$refs.countDown.reset()
      this.$refs.countDown.start()
    }
  },
  computed: {
    timeSlot: function() {
      return (time) => {
        let hour = new Date(time).getHours()
        // 根据小时部分来判断是早上、中午还是晚上
        return hour < 12? '早' : hour < 18? '中' : '晚'
      }
      
    }
  },
  data() {
    return {
      isTimerRunning: false,
      todayFetalRecords: null,
      fetalInfo: {
        userId: 0,
        startTime: 0,
        totalCount: 0,
        validCount: 0,
        clickRecords: [],
        lastValidTime: 0
      },
      remainingTime: 3600000,
      validIntervalMinute: 2
    }
  },
  methods: {
    async getTodayFetal() {
      const resp = await api.get('/fetalMovement/today', this.fetalInfo)
      this.todayFetalRecords = resp.result 
    },
    startTimer(force = false) {
      if (!this.isTimerRunning || force) {
        // 初始化计时器
        this.isTimerRunning = true
        this.fetalInfo.totalCount = 0
        this.fetalInfo.validCount = 0
        this.fetalInfo.startTime = new Date().getTime()
        this.fetalInfo.clickRecords = []
        this.remainingTime = 3600000
        this.$refs.countDown.reset()
        this.$refs.countDown.start()
        // 存入localStorage
        localStorage.setItem("startTime", this.fetalInfo.startTime)
        localStorage.setItem("fetalInfo", JSON.stringify(this.fetalInfo))
      }
    },
    count() {
      if (!this.isTimerRunning) {
        return
      }
      this.fetalInfo.totalCount = this.fetalInfo.totalCount + 1
      const clickTime = new Date().getTime()
      this.fetalInfo.clickRecords.push({
        userId: 0,
        clickTime: clickTime
      })
      // 计算有效点击次数: 第一次点击或者这一次点击距离上一次有效点击间隔自定义间隔以上
      if (this.fetalInfo.clickRecords.length == 1 || (clickTime - this.fetalInfo.lastValidTime) / 1000 >= this.validIntervalMinute * 60) {
        this.fetalInfo.validCount++
      }
      // 更新点击时间
      this.fetalInfo.lastValidTime = clickTime
      localStorage.setItem("fetalInfo", JSON.stringify(this.fetalInfo))

    },
    preEndCounting() {
      Dialog.confirm({
        message: '是否将此次记录保存',
      })
        .then(() => {
          this.endCounting()
        })
        .catch(() => {
          this.endCounting(false)
        });
    },
    endCounting(upload = true) {
      this.isTimerRunning = false;
      this.$refs.countDown.pause();
      this.fetalInfo.endTime = new Date().getTime()
      if (upload) {
        // 将记录数据发送到后台
        api.post('/fetalMovement/record', this.fetalInfo)
          .then(() => {
            Notify({
              message: '上传记录成功',
              background: '#7cee0a98'
            });
            this.getTodayFetal()
            localStorage.setItem("startTime", null)
          })
          .catch(() => {
            Notify({
              message: '上传记录失败',
              background: '#ffe1e1'
            });
          })
      }

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
