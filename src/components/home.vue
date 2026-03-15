<!-- Home.vue -->
<template>
  <div class="home-container">
    <!-- 欢迎区 -->
    <section class="welcome-section">
      <h1 class="welcome-title">欢迎使用接口自动化测试平台 V1.0.0</h1>
      <p class="welcome-desc">
        本平台提供一站式的接口自动化测试解决方案，支持多环境配置、多种数据源、高性能并发执行、可视化报告等功能。
      </p>
      <!-- 功能卡片 -->
      <div class="function-cards">
        <div
          v-for="card in functionCards"
          :key="card.title"
          class="function-card"
        >
          <h3 class="card-title">{{ card.title }}</h3>
          <p class="card-desc">{{ card.desc }}</p>
          <button class="card-btn">{{ card.btnText }}</button>
        </div>
      </div>
    </section>

    <!-- 系统状态和操作指南 -->
    <section class="system-section">
      <h2 class="section-title">系统状态</h2>
      <div class="system-cards">
        <div class="system-card">
          <h3 class="card-subtitle">环境配置</h3>
          <div class="card-item">当前环境: TEST</div>
          <div class="card-item">最大并发数: 1</div>
        </div>
        <div class="system-card">
          <h3 class="card-subtitle">测试用例</h3>
          <div class="card-item">CSV文件: 0 个</div>
          <div class="card-item">Excel文件: 0 个</div>
        </div>
        <div class="system-card">
          <h3 class="card-subtitle">测试报告</h3>
          <div class="card-item">HTML报告: 0 个</div>
          <div class="card-item">JSON报告: 0 个</div>
        </div>
      </div>

      <!-- 平台操作指南 -->
      <div class="guide-card">
        <h3 class="guide-title">平台操作指南</h3>
        <p class="guide-desc">查看详细的使用指南，了解如何配置和测试接口</p>
        <button class="guide-btn">查看操作指南</button>
      </div>

      <!-- 页脚 -->
      <footer class="footer">
        &copy; 2026 接口自动化测试平台 V1.0.0
      </footer>
    </section>
  </div>
</template>

<script setup>
const functionCards = [
  {
    title: '配置管理',
    desc: '支持全局配置、多环境配置，灵活管理测试参数',
    btnText: '进入配置'
  },
  {
    title: '用例管理',
    desc: '支持API文档、Excel/CSV，可视化管理',
    btnText: '进入管理'
  },
  {
    title: '执行测试',
    desc: '高性能并发执行，实时监控测试进度',
    btnText: '开始执行'
  },
  {
    title: '测试报告',
    desc: '可视化HTML报告，详细的测试结果分析',
    btnText: '查看报告'
  }
]
</script>

<style scoped>
.home-container {
  width: 100%;
  min-height: 100%;
}

.welcome-section {
  background-color: #6f42c1;
  color: #fff;
  padding: 40px 20px;
  text-align: center;
}

.welcome-title {
  font-size: 32px;
  margin-bottom: 20px;
  font-weight: bold;
}

.welcome-desc {
  font-size: 18px;
  margin-bottom: 40px;
  line-height: 1.6;
}

.function-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  padding: 0 20px;
  width: 100%;
  margin: 0 auto;
}

.function-card {
  background-color: #fff;
  color: #333;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.card-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 12px;
}

.card-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 24px;
  line-height: 1.5;
}

.card-btn {
  background: linear-gradient(135deg, #6f42c1, #8566cc);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 24px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.card-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(111, 66, 193, 0.3);
}

.system-section {
  padding: 40px 20px;
  background-color: #6f42c1;
  color: #fff;
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 24px;
  padding-left: 20px;
}

.system-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  width: 100%;
  margin: 0 auto 40px;
}

.system-card {
  background-color: #f8f9fa;
  color: #333;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.card-subtitle {
  font-size: 18px;
  font-weight: bold;
  color: #6f42c1;
  margin-bottom: 16px;
}

.card-item {
  background-color: #fff;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 12px;
  color: #333;
}

.card-item:last-child {
  margin-bottom: 0;
}

.guide-card {
  background-color: #f8f9fa;
  color: #333;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  width: 100%;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.guide-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 12px;
}

.guide-desc {
  font-size: 16px;
  color: #666;
  margin-bottom: 24px;
}

.guide-btn {
  background-color: #17a2b8;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px 28px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.guide-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(23, 162, 184, 0.3);
}

.footer {
  text-align: center;
  padding: 20px;
  color: #fff;
  font-size: 14px;
  margin-top: 40px;
}
</style>