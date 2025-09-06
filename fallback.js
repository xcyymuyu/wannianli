// 备用的简化版天干地支计算
// 当 lunisolar 库加载失败时使用

const fallbackTiangan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const fallbackDizhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
const fallbackZodiac = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']

// 简化的天干地支计算（基于公历）
function fallbackCalculate(year, month, day) {
    // 简化的年柱计算
    const yearGanIndex = (year - 4) % 10
    const yearZhiIndex = (year - 4) % 12
    const yearGanZhi = fallbackTiangan[yearGanIndex] + fallbackDizhi[yearZhiIndex]
    
    // 简化的月柱计算
    const monthGanIndex = ((year - 4) * 12 + month - 1) % 10
    const monthZhiIndex = (month - 1) % 12
    const monthGanZhi = fallbackTiangan[monthGanIndex] + fallbackDizhi[monthZhiIndex]
    
    // 简化的日柱计算
    const dayCount = Math.floor((new Date(year, month - 1, day) - new Date(1900, 0, 1)) / (24 * 60 * 60 * 1000))
    const dayGanIndex = (dayCount + 9) % 10
    const dayZhiIndex = (dayCount + 11) % 12
    const dayGanZhi = fallbackTiangan[dayGanIndex] + fallbackDizhi[dayZhiIndex]
    
    // 生肖
    const zodiacIndex = (year - 4) % 12
    const zodiac = fallbackZodiac[zodiacIndex < 0 ? zodiacIndex + 12 : zodiacIndex]
    
    return {
        yearGanZhi,
        monthGanZhi,
        dayGanZhi,
        zodiac
    }
}

// 备用查询函数
function fallbackQuery() {
    const year = parseInt(document.getElementById('year').value)
    const month = parseInt(document.getElementById('month').value)
    const day = parseInt(document.getElementById('day').value)
    
    if (!year || !month || !day) {
        alert('请完整输入年月日信息！')
        return
    }
    
    const result = fallbackCalculate(year, month, day)
    
    // 显示基本结果
    document.getElementById('gregorianDate').textContent = `${year}年${month}月${day}日`
    document.getElementById('lunarDate').textContent = '农历信息需要完整版本'
    document.getElementById('yearTianganDizhi').textContent = `${result.yearGanZhi}年`
    document.getElementById('monthTianganDizhi').textContent = `${result.monthGanZhi}月`
    document.getElementById('dayTianganDizhi').textContent = `${result.dayGanZhi}日`
    document.getElementById('zodiac').textContent = result.zodiac
    document.getElementById('wuxing').textContent = '需要完整版本'
    
    // 显示提示信息和重试按钮
    let dressGuideContainer = document.getElementById('dressGuideContainer')
    if (!dressGuideContainer) {
        dressGuideContainer = document.createElement('div')
        dressGuideContainer.id = 'dressGuideContainer'
        document.getElementById('resultSection').appendChild(dressGuideContainer)
    }
    
    dressGuideContainer.innerHTML = `
        <div class="dress-guide-section">
            <h3>功能受限提示</h3>
            <div style="text-align: center; padding: 20px;">
                <p style="color: #e74c3c; margin-bottom: 15px;">
                    万年历库加载失败，当前仅显示基本的天干地支信息。<br>
                    五行穿衣指南功能暂时不可用。
                </p>
                <button onclick="location.reload()" style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    margin-right: 10px;
                ">刷新页面重试</button>
                <button onclick="tryReloadLibrary()" style="
                    background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                ">重新加载库</button>
            </div>
        </div>
    `
    
    document.getElementById('resultSection').style.display = 'block'
}

// 尝试重新加载lunisolar库
function tryReloadLibrary() {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/lunisolar@2.6.0/dist/lunisolar.min.js'
    script.onload = () => {
        if (typeof lunisolar !== 'undefined') {
            window.useFallback = false
            alert('库加载成功！现在可以使用完整功能了。')
        } else {
            alert('库加载仍然失败，请检查网络连接。')
        }
    }
    script.onerror = () => {
        alert('库加载失败，请检查网络连接或稍后重试。')
    }
    document.head.appendChild(script)
}
