// 使用全局加载的lunisolar库
const lunisolar = window.lunisolar;

// 天干地支对照表
const tiangan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const dizhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
const zodiac = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
const wuxing = ['木', '火', '土', '金', '水']

// 五行纳音对照表（简化版）
const naying = [
    '海中金', '炉中火', '大林木', '路旁土', '剑锋金',
    '山头火', '涧下水', '城头土', '白蜡金', '杨柳木',
    '泉中水', '屋上土', '霹雳火', '松柏木', '长流水',
    '砂石金', '山下火', '平地木', '壁上土', '金箔金',
    '覆灯火', '天河水', '大驿土', '钗钏金', '桑柘木',
    '大溪水', '沙中土', '天上火', '石榴木', '大海水'
]

// 五行穿衣指南相关数据
const wuxingColors = {
    '金': ['白', '银', '灰', '米白'],
    '木': ['绿', '青', '橄榄绿', '墨绿'],
    '水': ['黑', '蓝', '藏青', '深蓝'],
    '火': ['红', '粉', '橙', '玫红'],
    '土': ['黄', '棕', '咖', '米黄']
}

// 五行生克关系
const wuxingRelations = {
    '金': { 克: '木', 被克: '火', 生: '水', 被生: '土' },
    '木': { 克: '土', 被克: '金', 生: '火', 被生: '水' },
    '水': { 克: '火', 被克: '土', 生: '木', 被生: '金' },
    '火': { 克: '金', 被克: '水', 生: '土', 被生: '木' },
    '土': { 克: '水', 被克: '木', 生: '金', 被生: '火' }
}

// 月令五行对照表（农历月份）
const monthWuxing = {
    1: '木',   // 寅月（立春后）
    2: '木',   // 卯月（惊蛰后）
    3: '土',   // 辰月（清明后）
    4: '火',   // 巳月（立夏后）
    5: '火',   // 午月（芒种后）
    6: '土',   // 未月（小暑后）
    7: '金',   // 申月（立秋后）
    8: '金',   // 酉月（白露后）
    9: '土',   // 戌月（寒露后）
    10: '水',  // 亥月（立冬后）
    11: '水',  // 子月（大雪后）
    12: '土'   // 丑月（小寒后）
}

// 获取月令五行（根据农历月份）
function getMonthWuxing(lunarMonth) {
    return monthWuxing[lunarMonth] || '土'
}

// 获取当前日期作为默认值
function setCurrentDate() {
    const now = new Date()
    document.getElementById('year').value = now.getFullYear()
    document.getElementById('month').value = now.getMonth() + 1
    document.getElementById('day').value = now.getDate()
}

// 分析日主强弱
function analyzeDayMasterStrength(dayStem, monthWuxing, yearStem, monthStem, yearBranch, monthBranch, dayBranch) {
    const dayWuxing = dayStem.e5.name
    let strength = 0
    
    // 月令生扶（权重最高）
    if (monthWuxing === dayWuxing) {
        strength += 4  // 得令（增强权重）
    } else if (wuxingRelations[monthWuxing].生 === dayWuxing) {
        strength += 3  // 得生
    } else if (wuxingRelations[monthWuxing].被生 === dayWuxing) {
        strength += 2  // 得助
    } else if (wuxingRelations[monthWuxing].克 === dayWuxing) {
        strength -= 3  // 被克
    } else if (wuxingRelations[monthWuxing].被克 === dayWuxing) {
        strength -= 2  // 被泄
    }
    
    // 年柱生扶（天干）
    const yearWuxing = yearStem.e5.name
    if (yearWuxing === dayWuxing) {
        strength += 1.5
    } else if (wuxingRelations[yearWuxing].生 === dayWuxing) {
        strength += 1.5
    } else if (wuxingRelations[yearWuxing].克 === dayWuxing) {
        strength -= 1
    }
    
    // 年柱生扶（地支）
    const yearBranchWuxing = yearBranch.e5.name
    if (yearBranchWuxing === dayWuxing) {
        strength += 1
    } else if (wuxingRelations[yearBranchWuxing].生 === dayWuxing) {
        strength += 1
    } else if (wuxingRelations[yearBranchWuxing].克 === dayWuxing) {
        strength -= 0.5
    }
    
    // 月柱生扶（天干）
    const monthStemWuxing = monthStem.e5.name
    if (monthStemWuxing === dayWuxing) {
        strength += 1.5
    } else if (wuxingRelations[monthStemWuxing].生 === dayWuxing) {
        strength += 1.5
    } else if (wuxingRelations[monthStemWuxing].克 === dayWuxing) {
        strength -= 1
    }
    
    // 月柱生扶（地支）
    const monthBranchWuxing = monthBranch.e5.name
    if (monthBranchWuxing === dayWuxing) {
        strength += 1
    } else if (wuxingRelations[monthBranchWuxing].生 === dayWuxing) {
        strength += 1
    } else if (wuxingRelations[monthBranchWuxing].克 === dayWuxing) {
        strength -= 0.5
    }
    
    // 日支生扶
    const dayBranchWuxing = dayBranch.e5.name
    if (dayBranchWuxing === dayWuxing) {
        strength += 1.5
    } else if (wuxingRelations[dayBranchWuxing].生 === dayWuxing) {
        strength += 1.5
    } else if (wuxingRelations[dayBranchWuxing].克 === dayWuxing) {
        strength -= 1
    }
    
    return Math.round(strength * 10) / 10  // 保留一位小数
}

// 确定用神
function determineUseGods(dayWuxing, strength) {
    if (strength > 0) {
        // 日主旺，需要克泄
        return {
            mainUseGod: wuxingRelations[dayWuxing].被克,  // 主用神：克日主
            subUseGod: wuxingRelations[dayWuxing].被生,   // 次用神：泄日主
            avoidGod: dayWuxing  // 忌神：同五行
        }
    } else {
        // 日主弱，需要生扶
        return {
            mainUseGod: wuxingRelations[dayWuxing].被生,  // 主用神：生日主
            subUseGod: dayWuxing,                         // 次用神：助日主
            avoidGod: wuxingRelations[dayWuxing].克       // 忌神：克日主
        }
    }
}

// 获取五行关系
function getWuxingRelation(wuxing1, wuxing2) {
    if (wuxing1 === wuxing2) return '同'
    if (wuxingRelations[wuxing1].生 === wuxing2) return '生'
    if (wuxingRelations[wuxing1].克 === wuxing2) return '克'
    if (wuxingRelations[wuxing1].被生 === wuxing2) return '被生'
    if (wuxingRelations[wuxing1].被克 === wuxing2) return '被克'
    return '无'
}

// 计算色彩等级
function calculateColorLevel(wuxing, useGods) {
    const { mainUseGod, subUseGod, avoidGod } = useGods
    
    // 直接匹配用神
    if (wuxing === mainUseGod) {
        return {
            level: '吉（主用）',
            description: '主用神色彩，力量最直接有效',
            colors: wuxingColors[wuxing]
        }
    } else if (wuxing === subUseGod) {
        return {
            level: '吉（次用）',
            description: '次用神色彩，辅助作用',
            colors: wuxingColors[wuxing]
        }
    } else if (wuxing === avoidGod) {
        return {
            level: '忌',
            description: '忌神色彩，避免使用',
            colors: wuxingColors[wuxing]
        }
    }
    
    // 分析生克关系
    const mainRelation = getWuxingRelation(wuxing, mainUseGod)
    const subRelation = getWuxingRelation(wuxing, subUseGod)
    const avoidRelation = getWuxingRelation(wuxing, avoidGod)
    
    // 根据生克关系判定等级
    if (mainRelation === '生' && avoidRelation === '生') {
        // 生主用神但生忌神
        return {
            level: '平',
            description: '生主用神但生忌神，需限量使用（≤10%）',
            colors: wuxingColors[wuxing]
        }
    } else if (mainRelation === '克' && subRelation === '生') {
        // 克主用神但生次用神
        return {
            level: '较不好',
            description: '克主用神但生次用神，整体不利',
            colors: wuxingColors[wuxing]
        }
    } else if (mainRelation === '生') {
        // 生主用神
        return {
            level: '平（生主）',
            description: '生主用神，可适量使用',
            colors: wuxingColors[wuxing]
        }
    } else if (subRelation === '生') {
        // 生次用神
        return {
            level: '平（生次）',
            description: '生次用神，可适量使用',
            colors: wuxingColors[wuxing]
        }
    } else if (mainRelation === '克') {
        // 克主用神
        return {
            level: '较不好',
            description: '克主用神，尽量避免',
            colors: wuxingColors[wuxing]
        }
    } else {
        // 中性关系
        return {
            level: '平（中性）',
            description: '中性色彩，可适量使用',
            colors: wuxingColors[wuxing]
        }
    }
}

// 计算五行穿衣指南
function calculateDressGuide(char8, lunarMonth) {
    const dayStem = char8.day.stem
    const yearStem = char8.year.stem
    const monthStem = char8.month.stem
    const yearBranch = char8.year.branch
    const monthBranch = char8.month.branch
    const dayBranch = char8.day.branch
    const dayWuxing = dayStem.e5.name
    const monthWuxingValue = getMonthWuxing(lunarMonth)
    
    // 分析日主强弱
    const strength = analyzeDayMasterStrength(dayStem, monthWuxingValue, yearStem, monthStem, yearBranch, monthBranch, dayBranch)
    
    // 确定用神
    const useGods = determineUseGods(dayWuxing, strength)
    
    // 计算各五行色彩等级
    const dressGuide = {}
    for (const wuxing of ['金', '木', '水', '火', '土']) {
        dressGuide[wuxing] = calculateColorLevel(wuxing, useGods)
    }
    
    return {
        dayMaster: dayWuxing,
        strength: strength > 0 ? '旺' : strength < 0 ? '弱' : '平',
        monthWuxing: monthWuxingValue,
        useGods: useGods,
        dressGuide: dressGuide,
        analysis: {
            monthWuxing: monthWuxingValue,
            dayMasterStrength: strength,
            mainUseGod: useGods.mainUseGod,
            subUseGod: useGods.subUseGod,
            avoidGod: useGods.avoidGod
        }
    }
}

// 显示穿衣指南
function displayDressGuide(dressGuide) {
    const { dayMaster, strength, monthWuxing, useGods, dressGuide: guide } = dressGuide
    
    // 创建穿衣指南HTML
    let dressGuideHTML = `
        <div class="dress-guide-section">
            <h3>五行穿衣指南</h3>
            <div class="analysis-info">
                <p><strong>日主：</strong>${dayMaster}（${strength}）</p>
                <p><strong>月令：</strong>${monthWuxing}</p>
                <p><strong>主用神：</strong>${useGods.mainUseGod} | <strong>次用神：</strong>${useGods.subUseGod} | <strong>忌神：</strong>${useGods.avoidGod}</p>
            </div>
            <div class="color-levels">
    `
    
    // 按等级分组显示
    const levelOrder = ['吉（主用）', '吉（次用）', '平（生主）', '平（生次）', '平（中性）', '平', '较不好', '忌']
    const levelNames = {
        '吉（主用）': '吉（首选）',
        '吉（次用）': '吉（次选）',
        '平（生主）': '平（生主用神）',
        '平（生次）': '平（生次用神）',
        '平（中性）': '平（中性）',
        '平': '平（限量）',
        '较不好': '较不好',
        '忌': '不宜'
    }
    
    levelOrder.forEach(level => {
        const colorsInLevel = Object.entries(guide).filter(([wuxing, data]) => data.level === level)
        if (colorsInLevel.length > 0) {
            dressGuideHTML += `
                <div class="color-level ${level.replace(/[（）]/g, '').replace('吉', 'good').replace('平', 'neutral').replace('较不好', 'bad').replace('忌', 'avoid')}">
                    <h4>${levelNames[level]}</h4>
                    <div class="color-items">
            `
            
            colorsInLevel.forEach(([wuxing, data]) => {
                dressGuideHTML += `
                    <div class="color-item">
                        <span class="wuxing-name">${wuxing}色：</span>
                        <span class="color-list">${data.colors.join('、')}</span>
                        <span class="description">${data.description}</span>
                    </div>
                `
            })
            
            dressGuideHTML += `
                    </div>
                </div>
            `
        }
    })
    
    dressGuideHTML += `
            </div>
        </div>
    `
    
    // 查找或创建穿衣指南容器
    let dressGuideContainer = document.getElementById('dressGuideContainer')
    if (!dressGuideContainer) {
        dressGuideContainer = document.createElement('div')
        dressGuideContainer.id = 'dressGuideContainer'
        document.getElementById('resultSection').appendChild(dressGuideContainer)
    }
    
    dressGuideContainer.innerHTML = dressGuideHTML
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
        const yearGanZhi = char8.year.name
        const monthGanZhi = char8.month.name
        const dayGanZhi = char8.day.name
        
        // 获取生肖
        const zodiacIndex = (lunarYear - 4) % 12
        const zodiacIndexFixed = zodiacIndex < 0 ? zodiacIndex + 12 : zodiacIndex
        
        // 获取五行（基于年柱天干）
        const yearStem = char8.year.stem
        const wuxingName = yearStem.e5.name
        
        // 计算五行穿衣指南
        const dressGuide = calculateDressGuide(char8, lunarMonth)
        
        // 显示结果
        document.getElementById('gregorianDate').textContent = `${year}年${month}月${day}日`
        document.getElementById('lunarDate').textContent = `农历${lunarYear}年${lunarMonth}月${lunarDay}日`
        document.getElementById('yearTianganDizhi').textContent = `${yearGanZhi}年`
        document.getElementById('monthTianganDizhi').textContent = `${monthGanZhi}月`
        document.getElementById('dayTianganDizhi').textContent = `${dayGanZhi}日`
        document.getElementById('zodiac').textContent = zodiac[zodiacIndexFixed]
        document.getElementById('wuxing').textContent = wuxingName
        
        // 显示穿衣指南
        displayDressGuide(dressGuide)
        
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
