<template>
  <div>
    <van-row>
      <van-col span="24"><h2>我们一起数胎动</h2></van-col>
    </van-row>
    <van-divider />
    <van-cell-group>
      <van-cell title="有效次数" :value="info.validCount"/>
      <van-cell title="总次数" :value="info.totalCount"/>
    </van-cell-group>
    <van-count-down class="box" ref="countDown" :time="remainingTime" @finish="endCounting">
      <template #default="timeData">
        <span class="block">{{ timeData.minutes }}</span>
        <span class="colon">:</span>
        <span class="block">{{ timeData.seconds }}</span>
      </template>
    </van-count-down>
    <van-grid :column-num="3" clickable>
      <van-grid-item text="开始计时" icon="play-circle-o" @click="startTimer(false)" />
      <van-grid-item text="动一下，点一下" icon="like" @click="count" />
      <van-grid-item text="重新计时" icon="replay" @click="startTimer(true)" />
    </van-grid>
     
</div>
</template>

<script>

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
      this.info = JSON.parse(localStorage.getItem("info"))
      this.remainingTime = 3600000 - overTime
    }
  },
  mounted() {
    if(this.isTimerRunning) {
      this.$refs.countDown.reset()
      this.$refs.countDown.start()
    }
  },
  data() {
    return {
      isTimerRunning: false,
      info: {
        userId: 0,
        startTime: 0,
        totalCount: 0,
        validCount: 0,
        clickRecords: [],
        lastValidTime: 0
      },
      remainingTime: 0,
      validIntervalMinute: 2
    }
  },
  methods: {
    startTimer(force = false) {
      if (!this.isTimerRunning || force) {
        // 初始化计时器
        this.isTimerRunning = true
        this.info.totalCount = 0
        this.info.validCount = 0
        this.info.startTime = new Date().getTime()
        this.info.clickRecords = []
        this.remainingTime = 3600000
        this.$refs.countDown.reset()
        this.$refs.countDown.start()
        // 存入localStorage
        localStorage.setItem("startTime", this.info.startTime)
        localStorage.setItem("info", JSON.stringify(this.info))
      }
    },
    count() {
      if (!this.isTimerRunning) {
        return
      }
      this.info.totalCount = this.info.totalCount + 1
      const clickTime = new Date().getTime()
      this.info.clickRecords.push({
        userId: 0,
        clickTime: clickTime
      })
      // 计算有效点击次数: 第一次点击或者这一次点击距离上一次有效点击间隔自定义间隔以上
      if ( this.info.clickRecords.length == 1 || (clickTime - this.info.lastValidTime) / 1000 >= this.validIntervalMinute * 60) {
        this.info.validCount++
        this.info.lastValidTime = clickTime
      }
      localStorage.setItem("info", JSON.stringify(this.info))
    },
    endCounting() {
      this.isTimerRunning = false;
      this.$refs.countDown.pause();
      // 将记录数据发送到后台
      // axios.post('http://localhost:520/babycare/fetalMovement/record', this.info)
      // .then(response => {
      //   console.log(response.data);
      // })
      // .catch(error => {
      //  console.error('Error:', error);
      // });
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.box {
  margin: 10px 10px;
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
</style>
