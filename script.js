// ============================================================================
// 天干地支查询工具 - 主程序
// ============================================================================

// ============================================================================
// 1. 全局变量和配置
// ============================================================================

// 全局变量
let lunisolar = null;
let takeSound = null;

// ============================================================================
// 2. 库加载模块
// ============================================================================

/**
 * 加载lunisolar库
 * 支持多个CDN源，确保加载成功
 */
const loadLunisolar = async () => {
    const jsBasePath = window.location.hostname.includes('github.io') ? 
        '/' + window.location.pathname.split('/').filter(Boolean)[0] + '/' : 
        './';
    
    // 尝试多个来源加载lunisolar
    const sources = [
        'https://cdn.jsdelivr.net/npm/lunisolar@2.0.0/dist/lunisolar.esm.js',
        'https://unpkg.com/lunisolar@2.0.0/dist/lunisolar.esm.js',
        jsBasePath + 'lib/lunisolar.esm.js'
    ];
    
    for (const source of sources) {
        try {
            console.log(`尝试从 ${source} 加载lunisolar...`);
            const module = await import(source);
            console.log(`✓ 成功从 ${source} 加载lunisolar`);
            return module.default;
        } catch (error) {
            console.warn(`✗ 从 ${source} 加载失败:`, error.message);
        }
    }
    throw new Error('所有lunisolar加载源都失败了');
};

/**
 * 加载takeSound插件
 * 用于获取纳音五行信息
 */
const loadTakeSound = async () => {
    const jsBasePath = window.location.hostname.includes('github.io') ? 
        '/' + window.location.pathname.split('/').filter(Boolean)[0] + '/' : 
        './';
    
    const takeSoundSources = [
        'https://cdn.jsdelivr.net/npm/@lunisolar/plugin-takesound@0.1.2/dist/index.mjs',
        'https://unpkg.com/@lunisolar/plugin-takesound@0.1.2/dist/index.mjs',
        jsBasePath + 'lib/takesound.mjs'
    ];
    
    for (const source of takeSoundSources) {
        try {
            console.log(`尝试从 ${source} 加载takeSound插件...`);
            const module = await import(source);
            console.log(`✓ 成功从 ${source} 加载takeSound插件`);
            // 根据官方示例，应该导入 takeSound
            return module.takeSound || module.default;
        } catch (error) {
            console.warn(`✗ 从 ${source} 加载takeSound插件失败:`, error.message);
        }
    }
    console.warn('takeSound插件加载失败，将使用传统五行计算');
    return null;
};

// ============================================================================
// 3. 工具函数模块
// ============================================================================

/**
 * 从lunisolar对象安全获取属性的辅助函数
 * @param {Object} obj - 要获取属性的对象
 * @param {string} path - 属性路径，用点分隔
 * @param {string} defaultValue - 默认值
 * @returns {*} 属性值或默认值
 */
function safeGet(obj, path, defaultValue = '未查询到') {
    try {
        const keys = path.split('.');
        let result = obj;
        for (const key of keys) {
            if (result === null || result === undefined) {
                return defaultValue;
            }
            result = result[key];
        }
        return result || defaultValue;
    } catch (error) {
        console.warn(`获取属性 ${path} 失败:`, error);
        return defaultValue;
    }
}

// ============================================================================
// 4. 天干地支基础数据模块
// ============================================================================

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

// ============================================================================
// 5. 五行穿衣推荐算法模块
// ============================================================================

// 五行色彩映射
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

/**
 * 获取月令五行（根据农历月份）
 * @param {number} lunarMonth - 农历月份
 * @returns {string} 五行属性
 */
function getMonthWuxing(lunarMonth) {
    return monthWuxing[lunarMonth] || '土'
}

/**
 * 分析日主强弱
 * 基于八字理论，分析日主在月令和其他干支中的强弱程度
 * @param {Object} dayStem - 日干
 * @param {string} monthWuxingValue - 月令五行
 * @param {Object} yearStem - 年干
 * @param {Object} monthStem - 月干
 * @param {Object} yearBranch - 年支
 * @param {Object} monthBranch - 月支
 * @param {Object} dayBranch - 日支
 * @returns {number} 强弱分数（正数为旺，负数为弱）
 */
function analyzeDayMasterStrength(dayStem, monthWuxingValue, yearStem, monthStem, yearBranch, monthBranch, dayBranch) {
    const dayWuxing = dayStem.e5.name
    let strength = 0
    
    // 月令生扶（权重最高）
    if (monthWuxingValue === dayWuxing) {
        strength += 4  // 得令（增强权重）
    } else if (wuxingRelations[monthWuxingValue].生 === dayWuxing) {
        strength += 3  // 得生
    } else if (wuxingRelations[monthWuxingValue].被生 === dayWuxing) {
        strength += 2  // 得助
    } else if (wuxingRelations[monthWuxingValue].克 === dayWuxing) {
        strength -= 3  // 被克
    } else if (wuxingRelations[monthWuxingValue].被克 === dayWuxing) {
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

/**
 * 确定用神
 * 根据日主强弱确定主用神、次用神和忌神
 * @param {string} dayWuxing - 日主五行
 * @param {number} strength - 日主强弱分数
 * @returns {Object} 用神信息
 */
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

/**
 * 获取五行关系
 * @param {string} wuxing1 - 五行1
 * @param {string} wuxing2 - 五行2
 * @returns {string} 关系类型
 */
function getWuxingRelation(wuxing1, wuxing2) {
    if (wuxing1 === wuxing2) return '同'
    if (wuxingRelations[wuxing1].生 === wuxing2) return '生'
    if (wuxingRelations[wuxing1].克 === wuxing2) return '克'
    if (wuxingRelations[wuxing1].被生 === wuxing2) return '被生'
    if (wuxingRelations[wuxing1].被克 === wuxing2) return '被克'
    return '无'
}

/**
 * 计算色彩等级
 * 根据五行与用神的关系确定色彩等级
 * @param {string} wuxing - 五行属性
 * @param {Object} useGods - 用神信息
 * @returns {Object} 色彩等级信息
 */
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

/**
 * 计算五行穿衣指南
 * 主函数，整合所有穿衣推荐算法
 * @param {Object} char8 - 八字信息
 * @param {number} lunarMonth - 农历月份
 * @returns {Object} 完整的穿衣指南
 */
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

/**
 * 生成穿衣推荐文本
 * 将穿衣指南转换为用户友好的文本描述
 * @param {Object} dressGuide - 穿衣指南对象
 * @returns {string} 推荐文本
 */
function generateDressRecommendationText(dressGuide) {
    const { dayMaster, strength, useGods, dressGuide: guide } = dressGuide;
    
    // 找到最佳推荐颜色
    const bestColors = [];
    const goodColors = [];
    const neutralColors = [];
    
    for (const [wuxing, data] of Object.entries(guide)) {
        if (data.level === '吉（主用）') {
            bestColors.push(...data.colors);
        } else if (data.level === '吉（次用）') {
            goodColors.push(...data.colors);
        } else if (data.level.includes('平')) {
            neutralColors.push(...data.colors);
        }
    }
    
    let recommendation = `日主${dayMaster}（${strength}），主用神：${useGods.mainUseGod}，次用神：${useGods.subUseGod}。`;
    
    if (bestColors.length > 0) {
        recommendation += ` 首选：${bestColors.slice(0, 3).join('、')}等${useGods.mainUseGod}色系。`;
    }
    if (goodColors.length > 0) {
        recommendation += ` 次选：${goodColors.slice(0, 2).join('、')}等${useGods.subUseGod}色系。`;
    }
    if (neutralColors.length > 0) {
        recommendation += ` 可选：${neutralColors.slice(0, 2).join('、')}等中性色系。`;
    }
    
    return recommendation;
}

/**
 * 显示穿衣指南
 * 在页面上显示详细的穿衣指南HTML
 * @param {Object} dressGuide - 穿衣指南对象
 */
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

// ============================================================================
// 6. 主要业务逻辑模块
// ============================================================================

/**
 * 查询天干地支主函数
 * 处理用户输入，调用lunisolar库，显示结果
 */
function queryTianganDizhi() {
    console.log('查询函数被调用');
    const year = parseInt(document.getElementById('year').value);
    const month = parseInt(document.getElementById('month').value);
    const day = parseInt(document.getElementById('day').value);
    
    // 验证输入
    if (!year || !month || !day) {
        alert('请输入完整的年月日信息');
        return;
    }
    
    if (year < 1900 || year > 2100) {
        alert('年份范围应在1900-2100之间');
        return;
    }
    
    if (month < 1 || month > 12) {
        alert('月份范围应在1-12之间');
        return;
    }
    
    if (day < 1 || day > 31) {
        alert('日期范围应在1-31之间');
        return;
    }
    
    try {
        // 创建lunisolar日期对象
        const date = lunisolar(new Date(year, month - 1, day));
        console.log('lunisolar对象:', date);
        
        // 使用lunisolar库的正确API获取数据
        const gregorianDate = `${year}年${month}月${day}日`;
        
        // 农历信息
        const lunarDate = date.lunar ? date.lunar.toString() : '未查询到';
        
        // 八字信息
        const yearGanZhi = date.char8?.year ? date.char8.year.toString() : '未查询到';
        const monthGanZhi = date.char8?.month ? date.char8.month.toString() : '未查询到';
        const dayGanZhi = date.char8?.day ? date.char8.day.toString() : '未查询到';
        
        // 生肖 - 使用lunisolar库的正确API
        let zodiacAnimal = '未查询到生肖';
        try {
            const dateStr = `${year}/${month}/${day}`;
            zodiacAnimal = lunisolar(dateStr).format('cZ年')  || '未查询到生肖';
        } catch (error) {
            console.warn('获取生肖失败:', error);
        }
        
        // 五行信息 - 使用takeSound插件获取纳音五行
        let wuxingInfo = '未查询到五行';
        try {
            // 优先使用takeSound插件获取纳音五行
            if (date.char8?.day?.takeSound) {
                wuxingInfo = date.char8?.day?.takeSound;
                console.log(`从takeSound插件获取纳音五行: ${wuxingInfo}`);
            }
        } catch (error) {
            console.warn('获取五行信息失败:', error);
            wuxingInfo = '未查询到五行';
        }
        
        // 穿衣推荐 - 基于天干地支数据计算
        let dressRecommendation = '未查询到';
        try {
            // 获取农历月份用于月令计算
            const lunarMonth = date.lunar ? date.lunar.month : month;
            
            // 调用script.js中的函数计算五行穿衣指南
            if (typeof calculateDressGuide === 'function') {
                const dressGuide = calculateDressGuide(date.char8, lunarMonth);
                
                // 生成穿衣推荐文本
                if (typeof generateDressRecommendationText === 'function') {
                    dressRecommendation = generateDressRecommendationText(dressGuide);
                } else {
                    // 如果generateDressRecommendationText不存在，使用简单格式
                    const { dayMaster, strength, useGods } = dressGuide;
                    dressRecommendation = `日主${dayMaster}（${strength}），主用神：${useGods.mainUseGod}，次用神：${useGods.subUseGod}`;
                }
                
                console.log('五行穿衣推荐计算完成:', dressGuide);
            } else {
                console.warn('calculateDressGuide函数未找到，请确保script.js已正确加载');
                dressRecommendation = '函数未加载';
            }
        } catch (error) {
            console.warn('穿衣推荐计算失败:', error);
            dressRecommendation = '计算失败';
        }
        
        // 显示结果
        document.getElementById('gregorianDate').textContent = gregorianDate;
        document.getElementById('lunarDate').textContent = lunarDate;
        document.getElementById('yearTianganDizhi').textContent = yearGanZhi;
        document.getElementById('monthTianganDizhi').textContent = monthGanZhi;
        document.getElementById('dayTianganDizhi').textContent = dayGanZhi;
        document.getElementById('zodiac').textContent = zodiacAnimal;
        document.getElementById('wuxing').textContent = wuxingInfo;
        
        // 添加穿衣推荐显示
        let dressElement = document.getElementById('dressRecommendation');
        if (!dressElement) {
            // 如果没有穿衣推荐元素，创建一个
            dressElement = document.createElement('div');
            dressElement.className = 'result-item highlight';
            dressElement.innerHTML = '<span class="label">穿衣推荐：</span><span class="value" id="dressRecommendationValue"></span>';
            document.querySelector('.result-card').appendChild(dressElement);
        }
        document.getElementById('dressRecommendationValue').textContent = dressRecommendation;
        
        // 显示结果区域
        document.getElementById('resultSection').style.display = 'block';
        
        console.log('查询结果显示成功:', {
            gregorianDate,
            lunarDate,
            yearGanZhi,
            monthGanZhi, 
            dayGanZhi,
            zodiacAnimal,
            wuxingInfo,
            dressRecommendation
        });
    } catch (error) {
        console.error('查询出错：', error);
        alert('查询出错，请检查输入的日期是否有效');
    }
}

/**
 * 设置今日按钮功能
 * 自动填充当前日期并查询
 */
function setTodayDate() {
    const now = new Date();
    document.getElementById('year').value = now.getFullYear();
    document.getElementById('month').value = now.getMonth() + 1;
    document.getElementById('day').value = now.getDate();
    
    // 自动查询今日的天干地支信息
    queryTianganDizhi();
}

// ============================================================================
// 7. 应用初始化和事件绑定模块
// ============================================================================

/**
 * 初始化应用
 * 加载库、绑定事件、设置初始状态
 */
async function initApp() {
    try {
        // 加载lunisolar和takeSound插件
        [lunisolar, takeSound] = await Promise.all([loadLunisolar(), loadTakeSound()]);
        console.log('lunisolar库加载成功');
        
        // 按照官方示例：import { takeSound } from '@lunisolar/plugin-takesound'
        // lunisolar.extend(takeSound)
        if (takeSound) {
            lunisolar.extend(takeSound);
            console.log('✓ takeSound插件扩展成功，现在可以使用纳音功能');
        } else {
            console.warn('⚠️ takeSound插件未加载，将使用传统五行计算');
        }
        
        // 绑定按钮事件
        const queryBtn = document.getElementById('queryBtn');
        const todayBtn = document.getElementById('todayBtn');
        
        if (queryBtn) {
            queryBtn.addEventListener('click', queryTianganDizhi);
            console.log('查询按钮事件绑定成功');
        }
        
        if (todayBtn) {
            todayBtn.addEventListener('click', setTodayDate);
            console.log('今日按钮事件绑定成功');
        }
        
        // 页面加载时自动设置今日日期并查询
        setTodayDate();
        
    } catch (error) {
        console.error('lunisolar库加载失败：', error);
        alert('系统初始化失败，请刷新页面重试');
    }
}

// ============================================================================
// 8. 页面加载和导出
// ============================================================================

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initApp);

// 导出函数供HTML调用
window.queryTianganDizhi = queryTianganDizhi
window.setTodayDate = setTodayDate