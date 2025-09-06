import lunisolar from './node_modules/lunisolar/dist/lunisolar.esm.js'

// 天干地支对照表
const tiangan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const dizhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
const zodiac = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
const wuxing = ['金', '木', '水', '火', '土']

// 五行纳音对照表（简化版）
const naying = [
    '海中金', '炉中火', '大林木', '路旁土', '剑锋金',
    '山头火', '涧下水', '城头土', '白蜡金', '杨柳木',
    '泉中水', '屋上土', '霹雳火', '松柏木', '长流水',
    '砂石金', '山下火', '平地木', '壁上土', '金箔金',
    '覆灯火', '天河水', '大驿土', '钗钏金', '桑柘木',
    '大溪水', '沙中土', '天上火', '石榴木', '大海水'
]

// 获取当前日期作为默认值
function setCurrentDate() {
    const now = new Date()
    document.getElementById('year').value = now.getFullYear()
    document.getElementById('month').value = now.getMonth() + 1
    document.getElementById('day').value = now.getDate()
}

// 查询天干地支
function queryTianganDizhi() {
    const year = parseInt(document.getElementById('year').value)
    const month = parseInt(document.getElementById('month').value)
    const day = parseInt(document.getElementById('day').value)
    
    // 验证输入
    if (!year || !month || !day) {
        alert('请完整输入年月日信息！')
        return
    }
    
    if (year < 1900 || year > 2100) {
        alert('年份范围应在1900-2100之间！')
        return
    }
    
    if (month < 1 || month > 12) {
        alert('月份范围应在1-12之间！')
        return
    }
    
    if (day < 1 || day > 31) {
        alert('日期范围应在1-31之间！')
        return
    }
    
    try {
        // 使用lunisolar创建日期对象
        const ls = lunisolar(new Date(year, month - 1, day))
        
        // 获取农历信息
        const lunar = ls.lunar
        const lunarYear = lunar.year
        const lunarMonth = lunar.month
        const lunarDay = lunar.day
        
        // 获取天干地支信息 - 使用char8属性
        const char8 = ls.char8
        const yearGanZhi = char8.year.toString()
        const monthGanZhi = char8.month.toString()
        const dayGanZhi = char8.day.toString()
        
        // 获取生肖
        const zodiacIndex = (lunarYear - 4) % 12
        const zodiacIndexFixed = zodiacIndex < 0 ? zodiacIndex + 12 : zodiacIndex
        
        // 获取五行（基于年柱）
        const yearGan = yearGanZhi.charAt(0)
        const yearZhi = yearGanZhi.charAt(1)
        const yearTianganIndex = tiangan.indexOf(yearGan)
        const yearDizhiIndex = dizhi.indexOf(yearZhi)
        const wuxingIndex = Math.floor((yearTianganIndex + yearDizhiIndex) / 2) % 5
        
        // 显示结果
        document.getElementById('gregorianDate').textContent = `${year}年${month}月${day}日`
        document.getElementById('lunarDate').textContent = `农历${lunarYear}年${lunarMonth}月${lunarDay}日`
        document.getElementById('yearTianganDizhi').textContent = `${yearGanZhi}年`
        document.getElementById('monthTianganDizhi').textContent = `${monthGanZhi}月`
        document.getElementById('dayTianganDizhi').textContent = `${dayGanZhi}日`
        document.getElementById('zodiac').textContent = zodiac[zodiacIndexFixed]
        document.getElementById('wuxing').textContent = wuxing[wuxingIndex]
        
        // 显示结果区域
        document.getElementById('resultSection').style.display = 'block'
        
    } catch (error) {
        console.error('查询失败：', error)
        alert('查询失败，请检查输入的日期是否有效！')
    }
}

// 页面加载完成后设置当前日期
document.addEventListener('DOMContentLoaded', function() {
    setCurrentDate()
    
    // 为输入框添加回车键支持
    document.getElementById('year').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') queryTianganDizhi()
    })
    
    document.getElementById('month').addEventListener('change', function() {
        if (this.value && document.getElementById('day').value) {
            queryTianganDizhi()
        }
    })
    
    document.getElementById('day').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') queryTianganDizhi()
    })
})

// 导出函数供HTML调用
window.queryTianganDizhi = queryTianganDizhi
