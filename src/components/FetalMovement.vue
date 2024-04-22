<template>
  <div>
    <van-row>
      <van-col span="24"><h2>我们一起数胎动</h2></van-col>
    </van-row>
    <van-divider />
    <van-cell-group>
      <van-cell title="有效次数" :value="totalCount"/>
      <van-cell title="总次数" :value="validCount"/>
    </van-cell-group>
    <van-count-down class="box" ref="countDown" :time="remainingTime" @finish="endCounting">
      <template #default="timeData">
        <span class="block">{{ timeData.minutes }}</span>
        <span class="colon">:</span>
        <span class="block">{{ timeData.seconds }}</span>
      </template>
    </van-count-down>
    <van-grid :column-num="3" clickable>
      <van-grid-item text="开始计时" icon="play-circle-o" @click="startTimer" />
      <van-grid-item text="动一下，点一下" icon="like" @click="count" />
      <van-grid-item text="结束计时" icon="stop-circle-o" @click="endCounting" />
    </van-grid>
     
</div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'FetalMovement',

  data() {
    return {
      isTimerRunning: false,
      remainingTime: 0,
      startTime: 0,
      totalCount: 0,
      validCount: 0,
      validIntervalMinute: 2, 
      lastValidTime: new Date(),
      clickRecords: []
    };
  },
  methods: {
    startTimer() {
      this.isTimerRunning = true
      this.totalCount = 0
      this.validCount = 0
      this.startTime = new Date()
      this.clickRecords = []
      this.remainingTime = 3600000
      this.$refs.countDown.reset()
      this.$refs.countDown.start();
    },
    count() {
      if (!this.isTimerRunning) {
        return
      }
      this.totalCount++
      const clickTime = new Date()
      this.clickRecords.push({
        userId: 0,
        clickTime: clickTime.getTime()
      })
      // 计算有效点击次数: 第一次点击或者这一次点击距离上一次有效点击间隔自定义间隔以上
      if ( this.clickRecords.length == 1 || (clickTime.getTime() - this.lastValidTime.getTime()) / 1000 >= this.validIntervalMinute * 60) {
        this.validCount++
        this.lastValidTime = clickTime
      }
    },
    endCounting() {
      clearInterval(this.timerInterval);
      this.isTimerRunning = false;
      this.$refs.countDown.pause();

      // 将记录数据发送到后台
      axios.post('http://localhost:520/babycare/fetalMovement/record', {
        userId: 0,
        startTime: this.startTime.getTime(),
        endTime: new Date().getTime(),
        totalCount: this.totalCount,
        validCount: this.validCount,
        clickRecords: this.clickRecords
      })
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
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
