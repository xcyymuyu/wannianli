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
        jsBasePath + 'src/assets/lib/lunisolar.esm.js'
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
        jsBasePath + 'src/assets/lib/takesound.mjs'
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

// 地支藏干对照表
const branchHiddenStems = {
    '子': ['癸'], '丑': ['己', '癸', '辛'], '寅': ['甲', '丙', '戊'],
    '卯': ['乙'], '辰': ['戊', '乙', '癸'], '巳': ['丙', '庚', '戊'],
    '午': ['丁', '己'], '未': ['己', '丁', '乙'], '申': ['庚', '壬', '戊'],
    '酉': ['辛'], '戌': ['戊', '辛', '丁'], '亥': ['壬', '甲']
}

// 天干五行对照表
const stemWuxing = {
    '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
    '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
}

// 十神关系表
const tenGods = {
    '甲': { '甲': '比肩', '乙': '劫财', '丙': '食神', '丁': '伤官', '戊': '偏财', 
           '己': '正财', '庚': '七杀', '辛': '正官', '壬': '偏印', '癸': '正印' },
    '乙': { '甲': '劫财', '乙': '比肩', '丙': '伤官', '丁': '食神', '戊': '正财', 
           '己': '偏财', '庚': '正官', '辛': '七杀', '壬': '正印', '癸': '偏印' },
    '丙': { '甲': '偏印', '乙': '正印', '丙': '比肩', '丁': '劫财', '戊': '食神', 
           '己': '伤官', '庚': '偏财', '辛': '正财', '壬': '七杀', '癸': '正官' },
    '丁': { '甲': '正印', '乙': '偏印', '丙': '劫财', '丁': '比肩', '戊': '伤官', 
           '己': '食神', '庚': '正财', '辛': '偏财', '壬': '正官', '癸': '七杀' },
    '戊': { '甲': '七杀', '乙': '正官', '丙': '偏印', '丁': '正印', '戊': '比肩', 
           '己': '劫财', '庚': '食神', '辛': '伤官', '壬': '偏财', '癸': '正财' },
    '己': { '甲': '正官', '乙': '七杀', '丙': '正印', '丁': '偏印', '戊': '劫财', 
           '己': '比肩', '庚': '伤官', '辛': '食神', '壬': '正财', '癸': '偏财' },
    '庚': { '甲': '偏财', '乙': '正财', '丙': '七杀', '丁': '正官', '戊': '偏印', 
           '己': '正印', '庚': '比肩', '辛': '劫财', '壬': '食神', '癸': '伤官' },
    '辛': { '甲': '正财', '乙': '偏财', '丙': '正官', '丁': '七杀', '戊': '正印', 
           '己': '偏印', '庚': '劫财', '辛': '比肩', '壬': '伤官', '癸': '食神' },
    '壬': { '甲': '食神', '乙': '伤官', '丙': '偏财', '丁': '正财', '戊': '七杀', 
           '己': '正官', '庚': '偏印', '辛': '正印', '壬': '比肩', '癸': '劫财' },
    '癸': { '甲': '伤官', '乙': '食神', '丙': '正财', '丁': '偏财', '戊': '正官', 
           '己': '七杀', '庚': '正印', '辛': '偏印', '壬': '劫财', '癸': '比肩' }
}

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

const monthBranchWuxing = {
    寅: '木', 
    卯: '木', 
    辰: '土', 
    巳: '火', 
    午: '火', 
    未: '土', 
    申: '金', 
    酉: '金', 
    戌: '土', 
    亥: '水', 
    子: '水', 
    丑: '土'
}

/**
 * 获取精确月令五行（根据节气）
 * @param {Object} date - lunisolar日期对象
 * @returns {string} 五行属性
 */
function getAccurateMonthWuxing(char8) {
    // 使用月地支计算
    try {
        const monthBranch = char8.month.branch.toString();
        if (monthBranch && monthBranchWuxing[monthBranch]) {
            return monthBranchWuxing[monthBranch];
        }
    } catch (error) {
        console.warn('获取月地支失败，使用农历月份备用方案:', error);
    }
}

/**
 * 获取月令五行（根据农历月份，保持向后兼容）
 * @param {number} lunarMonth - 农历月份
 * @returns {string} 五行属性
 */
function getMonthWuxing(lunarMonth) {
    return monthWuxing[lunarMonth] || '土'
}

/**
 * 分析地支藏干对日主的影响
 * @param {Object} dayBranch - 日支
 * @param {Object} monthBranch - 月支
 * @param {Object} yearBranch - 年支
 * @param {string} dayWuxing - 日主五行
 * @returns {number} 藏干对日主的强弱影响分数
 */
function analyzeBranchHiddenStems(dayBranch, monthBranch, yearBranch, dayWuxing) {
    const dayHidden = branchHiddenStems[dayBranch.name] || [];
    const monthHidden = branchHiddenStems[monthBranch.name] || [];
    const yearHidden = branchHiddenStems[yearBranch.name] || [];
    
    let hiddenStrength = 0;
    const allHidden = [...dayHidden, ...monthHidden, ...yearHidden];
    
    console.log(`分析地支藏干: 日支${dayBranch.name}藏${dayHidden.join('、')}, 月支${monthBranch.name}藏${monthHidden.join('、')}, 年支${yearBranch.name}藏${yearHidden.join('、')}`);
    
    allHidden.forEach(hiddenStem => {
        const hiddenWuxing = stemWuxing[hiddenStem];
        if (hiddenWuxing === dayWuxing) {
            hiddenStrength += 0.5; // 藏干同五行，助身
            console.log(`藏干${hiddenStem}(${hiddenWuxing})与日主同五行，+0.5`);
        } else if (wuxingRelations[hiddenWuxing].生 === dayWuxing) {
            hiddenStrength += 0.3; // 藏干生扶日主
            console.log(`藏干${hiddenStem}(${hiddenWuxing})生扶日主${dayWuxing}，+0.3`);
        } else if (wuxingRelations[hiddenWuxing].克 === dayWuxing) {
            hiddenStrength -= 0.3; // 藏干克制日主
            console.log(`藏干${hiddenStem}(${hiddenWuxing})克制日主${dayWuxing}，-0.3`);
        }
    });
    
    console.log(`地支藏干总影响: ${hiddenStrength}`);
    return Math.round(hiddenStrength * 10) / 10;
}

/**
 * 分析十神关系
 * @param {Object} dayStem - 日干
 * @param {Array} otherStems - 其他天干数组
 * @returns {Object} 十神分析结果
 */
function analyzeTenGods(dayStem, otherStems) {
    const dayStemName = dayStem.name;
    const tenGodsAnalysis = {};
    
    console.log(`分析十神关系，日干: ${dayStemName}`);
    
    otherStems.forEach((stem, index) => {
        const stemName = stem.name;
        const tenGod = tenGods[dayStemName][stemName];
        tenGodsAnalysis[tenGod] = (tenGodsAnalysis[tenGod] || 0) + 1;
        console.log(`${stemName} -> ${tenGod}`);
    });
    
    console.log('十神统计:', tenGodsAnalysis);
    return tenGodsAnalysis;
}

/**
 * 获取季节调候用神
 * @param {string} dayWuxing - 日主五行
 * @param {string} seasonWuxing - 季节五行
 * @returns {Object} 季节调候调整
 */
function getSeasonalAdjustment(dayWuxing, seasonWuxing) {
    // 根据季节和日主五行确定调候用神
    const adjustments = {
        'spring': { '木': 0.2, '水': 0.1, '火': -0.1, '金': -0.2, '土': -0.1 },
        'summer': { '火': 0.2, '土': 0.1, '水': -0.2, '木': -0.1, '金': -0.1 },
        'autumn': { '金': 0.2, '土': 0.1, '木': -0.2, '火': -0.1, '水': -0.1 },
        'winter': { '水': 0.2, '金': 0.1, '火': -0.2, '土': -0.1, '木': -0.1 }
    };
    
    // 根据季节五行确定季节
    let season = 'spring';
    if (['火'].includes(seasonWuxing)) season = 'summer';
    else if (['金'].includes(seasonWuxing)) season = 'autumn';
    else if (['水'].includes(seasonWuxing)) season = 'winter';
    else if (['土'].includes(seasonWuxing)) {
        // 土月需要根据具体节气判断
        season = 'autumn'; // 默认秋季
    }
    
    console.log(`季节调候: ${season} (${seasonWuxing}), 日主: ${dayWuxing}`);
    return adjustments[season] || {};
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
 * 高级用神选择算法
 * 考虑十神分析和调候用神
 * @param {string} dayWuxing - 日主五行
 * @param {number} strength - 日主强弱分数
 * @param {Object} tenGodsAnalysis - 十神分析结果
 * @param {string} seasonWuxing - 季节五行
 * @returns {Object} 用神信息
 */
function determineAdvancedUseGods(dayWuxing, strength, tenGodsAnalysis, seasonWuxing) {
    // 分析十神情况
    const hasKillGod = (tenGodsAnalysis['七杀'] || 0) > 0 || (tenGodsAnalysis['正官'] || 0) > 0;
    const hasWealth = (tenGodsAnalysis['正财'] || 0) > 0 || (tenGodsAnalysis['偏财'] || 0) > 0;
    const hasSeal = (tenGodsAnalysis['正印'] || 0) > 0 || (tenGodsAnalysis['偏印'] || 0) > 0;
    const hasFood = (tenGodsAnalysis['食神'] || 0) > 0 || (tenGodsAnalysis['伤官'] || 0) > 0;
    
    console.log(`十神分析: 官杀${hasKillGod ? '有' : '无'}, 财星${hasWealth ? '有' : '无'}, 印星${hasSeal ? '有' : '无'}, 食伤${hasFood ? '有' : '无'}`);
    
    if (strength > 0) {
        // 日主旺的情况
        if (hasKillGod) {
            // 有官杀，优先用官杀
            console.log('日主旺有官杀，用官杀');
            return {
                mainUseGod: wuxingRelations[dayWuxing].被克, // 用官杀
                subUseGod: wuxingRelations[dayWuxing].被生,   // 用食伤
                avoidGod: dayWuxing,
                reason: '日主旺有官杀，用官杀制身'
            };
        } else if (hasWealth) {
            // 有财星，用财
            console.log('日主旺有财星，用财');
            return {
                mainUseGod: wuxingRelations[dayWuxing].被生, // 用财
                subUseGod: wuxingRelations[dayWuxing].被克,   // 用官杀
                avoidGod: dayWuxing,
                reason: '日主旺有财星，用财泄身'
            };
        } else if (hasFood) {
            // 有食伤，用食伤
            console.log('日主旺有食伤，用食伤');
            return {
                mainUseGod: wuxingRelations[dayWuxing].被生, // 用食伤
                subUseGod: wuxingRelations[dayWuxing].被克,   // 用官杀
                avoidGod: dayWuxing,
                reason: '日主旺有食伤，用食伤泄身'
            };
        }
    } else {
        // 日主弱的情况
        if (hasSeal) {
            // 有印星，用印
            console.log('日主弱有印星，用印');
            return {
                mainUseGod: wuxingRelations[dayWuxing].被生, // 用印
                subUseGod: dayWuxing,                         // 用比劫
                avoidGod: wuxingRelations[dayWuxing].克,
                reason: '日主弱有印星，用印生身'
            };
        } else if (hasKillGod) {
            // 有官杀，用印化杀
            console.log('日主弱有官杀，用印化杀');
            return {
                mainUseGod: wuxingRelations[dayWuxing].被生, // 用印
                subUseGod: dayWuxing,                         // 用比劫
                avoidGod: wuxingRelations[dayWuxing].克,
                reason: '日主弱有官杀，用印化杀生身'
            };
        }
    }
    
    // 默认用神选择
    console.log('使用默认用神选择');
    const defaultUseGods = determineUseGods(dayWuxing, strength);
    return {
        ...defaultUseGods,
        reason: '默认用神选择'
    };
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
 * @returns {Object} 完整的穿衣指南
 */
function calculateDressGuide(char8) {
    const dayStem = char8.day.stem
    const yearStem = char8.year.stem
    const monthStem = char8.month.stem
    const yearBranch = char8.year.branch
    const monthBranch = char8.month.branch
    const dayBranch = char8.day.branch
    const dayWuxing = dayStem.e5.name
    const monthWuxingValue = getAccurateMonthWuxing(char8)
    
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
 * 计算高级五行穿衣指南
 * 整合所有命理优化算法
 * @param {Object} char8 - 八字信息
 * @param {Object} date - lunisolar日期对象
 * @returns {Object} 完整的穿衣指南
 */
function calculateAdvancedDressGuide(char8, date) {
    const dayStem = char8.day.stem;
    const yearStem = char8.year.stem;
    const monthStem = char8.month.stem;
    const yearBranch = char8.year.branch;
    const monthBranch = char8.month.branch;
    const dayBranch = char8.day.branch;
    const dayWuxing = dayStem.e5.name;
    
    console.log('=== 开始高级穿衣指南计算 ===');
    
    // 1. 精确月令计算（按节气）
    const seasonWuxing = getAccurateMonthWuxing(char8);
    
    // 2. 地支藏干分析
    const hiddenStrength = analyzeBranchHiddenStems(dayBranch, monthBranch, yearBranch, dayWuxing);
    
    // 3. 十神分析
    const tenGodsAnalysis = analyzeTenGods(dayStem, [yearStem, monthStem]);
    
    // 4. 综合强弱分析
    const baseStrength = analyzeDayMasterStrength(dayStem, seasonWuxing, yearStem, monthStem, yearBranch, monthBranch, dayBranch);
    const finalStrength = baseStrength + hiddenStrength;
    
    console.log(`综合强弱分析: 基础${baseStrength} + 藏干${hiddenStrength} = ${finalStrength}`);
    
    // 5. 高级用神选择
    const useGods = determineAdvancedUseGods(dayWuxing, finalStrength, tenGodsAnalysis, seasonWuxing);
    
    // 6. 季节调候
    const seasonalAdjustment = getSeasonalAdjustment(dayWuxing, seasonWuxing);
    
    // 7. 计算最终穿衣指南
    const dressGuide = {};
    for (const wuxing of ['金', '木', '水', '火', '土']) {
        const baseLevel = calculateColorLevel(wuxing, useGods);
        const adjustment = seasonalAdjustment[wuxing] || 0;
        
        dressGuide[wuxing] = {
            ...baseLevel,
            seasonalAdjustment: adjustment,
            finalScore: (baseLevel.level === '吉（主用）' ? 10 : 
                        baseLevel.level === '吉（次用）' ? 8 :
                        baseLevel.level.includes('平') ? 5 :
                        baseLevel.level === '较不好' ? 2 : 0) + adjustment * 10
        };
    }
    
    console.log('=== 高级穿衣指南计算完成 ===');
    
    return {
        dayMaster: dayWuxing,
        strength: finalStrength > 0 ? '旺' : finalStrength < 0 ? '弱' : '平',
        seasonWuxing: seasonWuxing,
        tenGods: tenGodsAnalysis,
        useGods: useGods,
        dressGuide: dressGuide,
        analysis: {
            seasonWuxing: seasonWuxing,
            dayMasterStrength: finalStrength,
            hiddenStrength: hiddenStrength,
            tenGods: tenGodsAnalysis,
            mainUseGod: useGods.mainUseGod,
            subUseGod: useGods.subUseGod,
            avoidGod: useGods.avoidGod,
            reason: useGods.reason,
            seasonalAdjustment: seasonalAdjustment
        }
    };
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
 * 在页面上显示详细的穿衣指南HTML，按照卡片式布局
 * @param {Object} dressGuide - 穿衣指南对象
 */
function displayDressGuide(dressGuide) {
    const { dayMaster, strength, seasonWuxing, useGods, dressGuide: guide } = dressGuide
    
    // 创建穿衣指南HTML
    let dressGuideHTML = `
        <div class="dress-guide-section">
            <h3>五行穿衣指南</h3>
            <div class="analysis-info">
                <p><strong>日主：</strong>${dayMaster}（${strength}）</p>
                <p><strong>月令：</strong>${seasonWuxing}</p>
                <p><strong>主用神：</strong>${useGods.mainUseGod} | <strong>次用神：</strong>${useGods.subUseGod} | <strong>忌神：</strong>${useGods.avoidGod}</p>
            </div>
            <div class="color-cards">
    `
    
    // 按等级分组显示，使用卡片式布局
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
    
    // 五行对应的高级颜色（统一使用一种颜色）
    const wuxingColors = {
        '金': '#D4AF37',  // 金色系 - 经典金色（高级感）
        '木': '#228B22',  // 木色系 - 森林绿（自然高级）
        '水': '#87CEEB',  // 水色系 - 浅蓝色（清新高级）
        '火': '#DC143C',  // 火色系 - 深红色（热情高级）
        '土': '#CD853F'   // 土色系 - 秘鲁色（温暖高级）
    }
    
    // 根据五行属性获取统一颜色
    const getWuxingColor = (wuxing) => {
        return wuxingColors[wuxing] || '#f8f9fa'
    }
    
    // 根据五行属性确定最佳文字颜色（高级配色）
    const getTextColorForWuxing = (wuxing) => {
        const textColors = {
            '金': '#8B4513',  // 马鞍棕色 - 在金色背景上高级
            '木': '#F0FFF0',  // 蜜瓜色 - 在绿色背景上清新
            '水': '#1E3A8A',  // 深蓝色 - 在浅蓝色背景上清晰
            '火': '#FFF8DC',  // 玉米丝色 - 在红色背景上温暖
            '土': '#F5F5DC'   // 米色 - 在土色背景上自然
        }
        return textColors[wuxing] || '#8B4513'
    }
    
    levelOrder.forEach(level => {
        const colorsInLevel = Object.entries(guide).filter(([wuxing, data]) => data.level === level)
        if (colorsInLevel.length > 0) {
            colorsInLevel.forEach(([wuxing, data]) => {
                // 根据五行属性获取统一的高级颜色
                const wuxingColor = getWuxingColor(wuxing)
                // 根据五行属性确定文字颜色
                const textColor = getTextColorForWuxing(wuxing)
                
                dressGuideHTML += `
                    <div class="color-card wuxing-${wuxing}" style="background: ${wuxingColor};">
                        <div class="card-content">
                            <div class="level-title" style="color: ${textColor};">${levelNames[level]}</div>
                            <div class="wuxing-color">
                                <span class="wuxing-name" style="color: ${textColor};">${wuxing}色：</span>
                                <span class="color-list" style="color: ${textColor};">${data.colors.join('、')}</span>
                            </div>
                            <div class="color-description" style="color: ${textColor};">${data.description}</div>
                        </div>
                    </div>
                `
            })
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

/**
 * 显示穿衣推荐推导过程
 * 在页面上显示详细的穿衣推荐分析过程
 * @param {Object} dressGuide - 穿衣指南对象
 */
function displayDressAnalysis(dressGuide) {
    const { dayMaster, strength, seasonWuxing, useGods, dressGuide: guide } = dressGuide
    
    // 创建推导过程HTML
    let analysisHTML = `
        <div class="dress-analysis-section">
            <h3>穿衣推荐推导过程</h3>
            <div class="analysis-steps">
                <div class="step">
                    <h4>1. 日主分析</h4>
                    <p><strong>日主：</strong>${dayMaster}</p>
                    <p><strong>强弱判断：</strong>${strength}</p>
                    <p><strong>月令：</strong>${seasonWuxing}</p>
                </div>
                
                <div class="step">
                    <h4>2. 用神确定</h4>
                    <p><strong>主用神：</strong>${useGods.mainUseGod}</p>
                    <p><strong>次用神：</strong>${useGods.subUseGod}</p>
                    <p><strong>忌神：</strong>${useGods.avoidGod}</p>
                </div>
                
                <div class="step">
                    <h4>3. 五行关系分析</h4>
                    <div class="wuxing-relations">
    `
    
    // 添加五行关系分析
    Object.entries(guide).forEach(([wuxing, data]) => {
        const level = data.level;
        const colors = data.colors.join('、');
        const description = data.description;
        
        // 根据等级推断关系类型
        let relationType = '';
        if (level.includes('主用')) {
            relationType = '主用神';
        } else if (level.includes('次用')) {
            relationType = '次用神';
        } else if (level === '忌') {
            relationType = '忌神';
        } else if (level.includes('生主')) {
            relationType = '生主用神';
        } else if (level.includes('生次')) {
            relationType = '生次用神';
        } else if (level.includes('克')) {
            relationType = '克主用神';
        } else {
            relationType = '中性关系';
        }
        
        analysisHTML += `
            <div class="relation-item">
                <span class="wuxing-name">${wuxing}色：</span>
                <span class="relation-type">${relationType}</span>
                <span class="level-badge level-${level.replace(/[（()]/g, '').replace(/[吉平较不好忌]/g, match => {
                    const levelMap = {'吉': 'auspicious', '平': 'neutral', '较不好': 'unfavorable', '忌': 'avoid'};
                    return levelMap[match] || 'neutral';
                })}">${level}</span>
                <span class="color-list">${colors}</span>
                <div class="relation-description">${description}</div>
            </div>
        `
    })
    
    analysisHTML += `
                    </div>
                </div>
                
                <div class="step">
                    <h4>4. 推荐总结</h4>
                    <div class="recommendation-summary">
                        <p><strong>首选颜色：</strong>${Object.entries(guide).filter(([_, data]) => data.level === '吉（主用）').map(([wuxing, data]) => `${wuxing}色(${data.colors.join('、')})`).join('、') || '无'}</p>
                        <p><strong>次选颜色：</strong>${Object.entries(guide).filter(([_, data]) => data.level === '吉（次用）').map(([wuxing, data]) => `${wuxing}色(${data.colors.join('、')})`).join('、') || '无'}</p>
                        <p><strong>避免颜色：</strong>${Object.entries(guide).filter(([_, data]) => data.level === '忌').map(([wuxing, data]) => `${wuxing}色(${data.colors.join('、')})`).join('、') || '无'}</p>
                    </div>
                </div>
            </div>
        </div>
    `
    
    // 查找或创建推导过程容器
    let analysisContainer = document.getElementById('dressAnalysisContainer')
    if (!analysisContainer) {
        analysisContainer = document.createElement('div')
        analysisContainer.id = 'dressAnalysisContainer'
        document.getElementById('resultSection').appendChild(analysisContainer)
    }
    
    analysisContainer.innerHTML = analysisHTML
}

// ============================================================================
// 6. 主要业务逻辑模块
// ============================================================================

/**
 * 查询天干地支主函数
 * 处理用户输入，调用lunisolar库，显示结果
 */
function queryTianganDizhi(showHour = false) {
    console.log('查询函数被调用，显示时辰:', showHour);
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
        
        // 农历信息 - 根据showHour参数决定是否显示时辰
        let lunarDate;
        if (showHour) {
            // 显示时辰：当点击今日按钮时
            lunarDate = lunisolar().format('lY年 lM(lL) lD lH時');
        } else {
            // 不显示时辰：手动输入时
            lunarDate = date.lunar ? date.format('lY年 lM(lL) lD') : '未查询到';
        }
        
        // 八字信息
        const yearGanZhi = date.char8?.year ? date.char8.year.toString() : '未查询到';
        const monthGanZhi = date.char8?.month ? date.char8.month.toString() : '未查询到';
        const dayGanZhi = date.char8?.day ? date.char8.day.toString() : '未查询到';
        
        // 生肖 - 使用lunisolar库的正确API
        let zodiacAnimal = '未查询到生肖';
        try {
            zodiacAnimal = lunisolar(new Date(year, month, day)).format('cZ年')  || '未查询到生肖';
        } catch (error) {
            console.warn('获取生肖失败:', error);
        }
        
        // 五行信息 - 使用takeSound插件获取纳音五行
        let wuxingInfo = '未查询到五行';
        try {
            // 优先使用takeSound插件获取纳音五行
            // if (date.char8?.day?.takeSound) {
            //     wuxingInfo = date.char8?.day?.takeSound;
            //     console.log(`从takeSound插件获取纳音五行: ${wuxingInfo}`);
            // }
            // 获取日五行
            wuxingInfo = date.char8?.year?.stem?.e5?.name || date.char8?.year?.branch?.e5?.name;
        } catch (error) {
            console.warn('获取五行信息失败:', error);
            wuxingInfo = '未查询到五行';
        }
        
        // 穿衣推荐 - 基于天干地支数据计算
        let dressRecommendation = '未查询到';
        try {
            // 优先使用高级算法
            if (typeof calculateAdvancedDressGuide === 'function') {
                console.log('使用高级穿衣指南算法');
                const dressGuide = calculateAdvancedDressGuide(date.char8, date);
                
                // 生成穿衣推荐文本
                if (typeof generateDressRecommendationText === 'function') {
                    dressRecommendation = generateDressRecommendationText(dressGuide);
                } else {
                    // 如果generateDressRecommendationText不存在，使用简单格式
                    const { dayMaster, strength, useGods } = dressGuide;
                    dressRecommendation = `日主${dayMaster}（${strength}），主用神：${useGods.mainUseGod}，次用神：${useGods.subUseGod}`;
                }
                
                // 显示详细的穿衣指南卡片
                if (typeof displayDressGuide === 'function') {
                    displayDressGuide(dressGuide);
                }
                
                // 显示穿衣推荐推导过程
                if (typeof displayDressAnalysis === 'function') {
                    displayDressAnalysis(dressGuide);
                }
                
                console.log('高级五行穿衣推荐计算完成:', dressGuide);
            } else if (typeof calculateDressGuide === 'function') {
                // 备用：使用基础算法
                console.log('使用基础穿衣指南算法');
                const lunarMonth = date.lunar ? date.lunar.month : month;
                const dressGuide = calculateDressGuide(date.char8, lunarMonth);
                
                // 生成穿衣推荐文本
                if (typeof generateDressRecommendationText === 'function') {
                    dressRecommendation = generateDressRecommendationText(dressGuide);
                } else {
                    const { dayMaster, strength, useGods } = dressGuide;
                    dressRecommendation = `日主${dayMaster}（${strength}），主用神：${useGods.mainUseGod}，次用神：${useGods.subUseGod}`;
                }
                
                // 显示详细的穿衣指南卡片
                if (typeof displayDressGuide === 'function') {
                    displayDressGuide(dressGuide);
                }
                
                // 显示穿衣推荐推导过程
                if (typeof displayDressAnalysis === 'function') {
                    displayDressAnalysis(dressGuide);
                }
                
                console.log('基础五行穿衣推荐计算完成:', dressGuide);
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
        
        // 移除已存在的穿衣推荐元素（如果存在）
        const existingDressElement = document.getElementById('dressRecommendation');
        if (existingDressElement) {
            existingDressElement.remove();
        }
        
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
    
    // 自动查询今日的天干地支信息，显示时辰
    queryTianganDizhi(true);
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
            queryBtn.addEventListener('click', () => queryTianganDizhi(false));
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