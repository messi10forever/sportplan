// script.js

document.addEventListener('DOMContentLoaded', () => {
    console.log('--- script.js loaded and DOM fully parsed ---'); // Confirm JS loaded

    // --- 1. 获取 HTML 元素的引用 ---
    const userInputForm = document.getElementById('user-input-form');

    // 获取所有输入字段
    const nicknameInput = document.getElementById('nickname');
    const genderSelect = document.getElementById('gender');
    const ageInput = document.getElementById('age');
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');
    const waistInput = document.getElementById('waist'); // Optional
    const hipInput = document.getElementById('hip');   // Optional
    const injuryStatusRadios = document.getElementsByName('injury-status'); // Injury status radio buttons
    const exerciseLevelSelect = document.getElementById('exercise-level'); // Optional

    // 获取可视化图表 Canvas 元素的引用
    const bmiChartCanvas = document.getElementById('bmi-chart');
    const whrChartCanvas = document.getElementById('whr-chart');

    // Get references to areas that will be shown/hidden and updated
    const assessmentResultsSection = document.getElementById('assessment-results');
    const exercisePlanSection = document.getElementById('exercise-plan');
    const viewPlanButton = document.getElementById('btn-view-plan');
    const injuryMapContainer = document.getElementById('injury-map-container');

    // Get references to elements for text results
    const bmiTextElement = document.getElementById('bmi-text');
    const whrTextElement = document.getElementById('whr-text');
    const recommendedWeightTextElement = document.getElementById('recommended-weight-text') ? document.getElementById('recommended-weight-text').querySelector('p') : null; // Get p tag, check if parent exists


    // --- 2. Listen for form submit event (Click "进行评估") ---
    if(userInputForm) {
        userInputForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent default form submission

            // --- 3. Read input values ---
            const nickname = nicknameInput.value.trim();
            const gender = genderSelect.value;
            const age = parseInt(ageInput.value);
            const heightCm = parseFloat(heightInput.value);
            const weightKg = parseFloat(weightInput.value);
            const waistCm = parseFloat(waistInput.value);
            const hipCm = parseFloat(hipInput.value);
            const exerciseLevel = exerciseLevelSelect.value;

            // Get selected injury status
            let injuryStatus = 'no'; // Default to no injury
            for (const radio of injuryStatusRadios) {
                if (radio.checked) {
                    injuryStatus = radio.value;
                    break;
                }
            }

            // --- 4. Basic input validation ---
            if (!nickname || !gender || isNaN(age) || isNaN(heightCm) || isNaN(weightKg) || age <= 0 || heightCm <= 0 || weightKg <= 0) {
                alert('请填写所有必填项并确保输入有效数字！');
                console.error('Input validation failed');
                return; // Stop further execution
            }

            console.log('Obtained user input:', {
                nickname,
                gender,
                age,
                heightCm,
                weightKg,
                waistCm: isNaN(waistCm) ? '未填写' : waistCm,
                hipCm: isNaN(hipCm) ? '未填写' : hipCm,
                injuryStatus,
                exerciseLevel: exerciseLevel === '' ? '未选择' : exerciseLevel
            });


            // --- 5. Perform calculations ---
            const heightM = heightCm / 100; // Convert height from cm to meters

            const bmi = calculateBMI(weightKg, heightM);
            const whr = calculateWHR(waistCm, hipCm); // handle non-numeric waist/hip in function
            const recommendedWeightRange = calculateRecommendedWeightRange(heightM);

            console.log('Calculation results:');
            console.log('BMI:', bmi);
            console.log('WHR:', whr);
            console.log('Recommended weight range (kg):', recommendedWeightRange);

            // --- 6. Update UI Display (After "进行评估" click) ---

            // Show assessment results section and "View Plan" button
             if(assessmentResultsSection) assessmentResultsSection.style.display = 'block'; // Or 'flex', 'grid' based on your CSS
             if(viewPlanButton) viewPlanButton.style.display = 'block'; // Or 'flex', 'grid'


            // Hide exercise plan section (if previously shown)
             if(exercisePlanSection) exercisePlanSection.style.display = 'none';

            // Update text results
            if(bmiTextElement) bmiTextElement.textContent = `您的 BMI 是 ${bmi.toFixed(1)}${getBMICategory(bmi)}。`; // toFixed(1) for 1 decimal place
            if(whrTextElement) whrTextElement.textContent = isNaN(whr) ? '腰围/臀围未填写或无效' : `您的腰臀比是 ${whr.toFixed(2)}${getWHRCategory(whr, gender)}。`; // toFixed(2) for 2 decimal places
            if(recommendedWeightTextElement) recommendedWeightTextElement.textContent = isNaN(recommendedWeightRange.min) ? '身高数据无效，无法计算推荐体重范围。' : `根据您的身高(${heightCm}cm)，推荐体重范围是 ${recommendedWeightRange.min}kg - ${recommendedWeightRange.max}kg。`;

            // --- 使用 Canvas API 绘制可视化图表 ---

            // 绘制 BMI 图表
            if (bmiChartCanvas) {
                const ctx = bmiChartCanvas.getContext('2d');
                if (ctx) {
                    // 设置 Canvas 尺寸 (如果需要，也可以在 CSS 中设置)
                    const canvasWidth = 300; // 示例宽度，可以调整
                    const canvasHeight = 200; // 示例高度，可以调整
                    bmiChartCanvas.width = canvasWidth;
                    bmiChartCanvas.height = canvasHeight;

                    // 清空之前的绘制内容
                    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

                    // 图表区域的内边距
                    const paddingLeft = 40; // 左侧留更多空间给刻度标签
                    const paddingRight = 100; // 右侧留更多空间给图例
                    const paddingTop = 25; // 顶部留空间给标题
                    const paddingBottom = 25; // 底部留空间给 X 轴标签（如果需要）

                    const chartAreaX = paddingLeft;
                    const chartAreaY = paddingTop;
                    const chartAreaWidth = canvasWidth - paddingLeft - paddingRight;
                    const chartAreaHeight = canvasHeight - paddingTop - paddingBottom;


                    // 绘制坐标轴
                    ctx.strokeStyle = '#888';
                    ctx.lineWidth = 1;

                    // 绘制 Y 轴
                    ctx.beginPath();
                    ctx.moveTo(chartAreaX, chartAreaY);
                    ctx.lineTo(chartAreaX, chartAreaY + chartAreaHeight);
                    ctx.stroke();

                    // 绘制 X 轴 (这里主要是一个参考轴)
                    ctx.beginPath();
                    ctx.moveTo(chartAreaX, chartAreaY + chartAreaHeight);
                    ctx.lineTo(chartAreaX + chartAreaWidth, chartAreaY + chartAreaHeight);
                    ctx.stroke();

                    // 绘制 Y 轴刻度和标签 (示例，表示 BMI 范围)
                    const maxBmiValue = 40; // 图表显示的 BMI 最大值
                    const bmiTicks = [0, 18.5, 24.9, 29.9, maxBmiValue]; // 重要的 BMI 分类边界和最大值
                    const tickLength = 5;

                    ctx.fillStyle = '#333';
                    ctx.font = '12px Arial';
                    ctx.textAlign = 'right'; // 刻度标签右对齐
                    ctx.textBaseline = 'middle'; // 刻度标签垂直居中对齐刻度线

                    bmiTicks.forEach(tickValue => {
                        const tickY = chartAreaY + chartAreaHeight - (tickValue / maxBmiValue) * chartAreaHeight;
                        // 绘制刻度线
                        ctx.beginPath();
                        ctx.moveTo(chartAreaX, tickY);
                        ctx.lineTo(chartAreaX - tickLength, tickY);
                        ctx.stroke();
                        // 绘制刻度标签 - 稍微向左移动，避免重叠
                        ctx.fillText(tickValue, chartAreaX - tickLength - 5, tickY); // 调整 X 坐标使其离轴线远一点
                    });


                    // 绘制 BMI 健康范围背景区域


                // 绘制代表用户 BMI 的柱子
                    const barWidth = 40; // 柱子的宽度，可以调整
                    const barX = chartAreaX + chartAreaWidth / 2 - barWidth / 2; // 柱子的 X 坐标，使其在图表区域X轴方向居中

                    // 计算柱子的高度和顶部 Y 坐标
                    const barHeight = (bmi / maxBmiValue) * chartAreaHeight;
                    const barY = chartAreaY + chartAreaHeight - barHeight;

                    // 绘制柱子
                    ctx.fillStyle = getBMICategoryColor(bmi); // 使用分类颜色
                    // 确保柱子绘制在图表区域内
                    if (barY >= chartAreaY && barY <= chartAreaY + chartAreaHeight) {
                         ctx.fillRect(barX, barY, barWidth, barHeight);
                    } else if (barY < chartAreaY) { // 如果 BMI 超过最大值，柱子画到图表顶部
                         ctx.fillRect(barX, chartAreaY, barWidth, chartAreaHeight);
                    } else { // 如果 BMI 小于0 (不应该发生), 柱子不绘制
                         // 不绘制柱子
                    }


                    // 在柱子上方显示具体的 BMI 数值
                    ctx.fillStyle = '#000';
                    ctx.font = '14px Arial bold';
                    ctx.textAlign = 'center'; // 文字在柱子上方居中
                    ctx.textBaseline = 'bottom'; // 文字底部与柱子顶部对齐

                    // 计算文本位置
                    const textX = barX + barWidth / 2; // 文本 X 坐标，柱子上方居中
                    const textY = barY - 5; // 文本 Y 坐标，柱子顶部上方一点

                    // 确保文本不会超出 Canvas 顶部
                    const adjustedTextY = Math.max(chartAreaY + ctx.measureText('M').actualBoundingBoxAscent, textY);

                     // *** 修改这里，只绘制数值或加上简单标签 ***
                    ctx.fillText(`BMI: ${bmi.toFixed(1)}`, textX, adjustedTextY); // 例如：显示 "BMI: 数值"
                    // 或者只显示数值：
                    // ctx.fillText(`${bmi.toFixed(1)}`, textX, adjustedTextY);


            // ... (绘制图表标题和图例的代码保持不变) ...


                    // 绘制图表标题
                    ctx.fillStyle = '#333';
                    ctx.font = '16px Arial bold';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    ctx.fillText('BMI 指数评估', canvasWidth / 2, 5);


                    // 绘制图例
                    const legendX = chartAreaX + chartAreaWidth + 10; // 图例的起始 X 坐标
                    let legendY = chartAreaY; // 图例的起始 Y 坐标
                    const legendColorSize = 15; // 图例颜色块大小
                    const legendTextSpacing = 5; // 颜色块和文字间距
                    const legendLineHeight = 20; // 图例行高

                    ctx.font = '12px Arial';
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'top';

                    const categories = [
                        { name: '偏瘦 (<18.5)', color: getBMICategoryColor(10) }, // 使用一个偏瘦的值获取颜色
                        { name: '正常 (18.5-24.9)', color: getBMICategoryColor(20) }, // 使用一个正常的值获取颜色
                        { name: '超重 (24.9-29.9)', color: getBMICategoryColor(26) }, // 使用一个超重的值获取颜色
                        { name: '肥胖 (>=29.9)', color: getBMICategoryColor(35) } // 使用一个肥胖的值获取颜色
                    ];

                    categories.forEach(cat => {
                        ctx.fillStyle = cat.color;
                        ctx.fillRect(legendX, legendY, legendColorSize, legendColorSize);
                        ctx.fillStyle = '#333';
                        ctx.fillText(cat.name, legendX + legendColorSize + legendTextSpacing, legendY);
                        legendY += legendLineHeight; // 下一行图例的 Y 坐标
                    });


                }
            }


            // 绘制 WHR 图表
            if (whrChartCanvas) {
                 const ctx = whrChartCanvas.getContext('2d');
                 if (ctx) {
                     const canvasWidth = 300; // 示例宽度，可以调整
                     const canvasHeight = 200; // 示例高度，可以调整
                     whrChartCanvas.width = canvasWidth;
                     whrChartCanvas.height = canvasHeight;

                     ctx.clearRect(0, 0, canvasWidth, canvasHeight);

                     // 只有在 WHR 有效时才绘制图表内容
                     if (!isNaN(whr)) {
                        // 图表区域的内边距
                        const paddingLeft = 40; // 左侧留更多空间给刻度标签
                        const paddingRight = 80; // 右侧留更多空间给图例
                        const paddingTop = 25; // 顶部留空间给标题
                        const paddingBottom = 25; // 底部留空间给 X 轴标签（如果需要）

                        const chartAreaX = paddingLeft;
                        const chartAreaY = paddingTop;
                        const chartAreaWidth = canvasWidth - paddingLeft - paddingRight;
                        const chartAreaHeight = canvasHeight - paddingTop - paddingBottom;

                        // 绘制坐标轴
                        ctx.strokeStyle = '#888';
                        ctx.lineWidth = 1;

                        // 绘制 Y 轴
                        ctx.beginPath();
                        ctx.moveTo(chartAreaX, chartAreaY);
                        ctx.lineTo(chartAreaX, chartAreaY + chartAreaHeight);
                        ctx.stroke();

                        // 绘制 X 轴 (这里主要是一个参考轴)
                        ctx.beginPath();
                        ctx.moveTo(chartAreaX, chartAreaY + chartAreaHeight);
                        ctx.lineTo(chartAreaX + chartAreaWidth, chartAreaY + chartAreaHeight);
                        ctx.stroke();

                        // 绘制 Y 轴刻度和标签 (示例，表示 WHR 范围)
                        const maxWhrValue = 1.2; // 图表显示的 WHR 最大值
                        // 根据性别显示不同的风险阈值刻度
                        const whrTicks = gender === 'male' ? [0, 0.9, maxWhrValue] : [0, 0.85, maxWhrValue];
                        const tickLength = 5;

                        ctx.fillStyle = '#333';
                        ctx.font = '12px Arial';
                        ctx.textAlign = 'right'; // 刻度标签右对齐
                        ctx.textBaseline = 'middle'; // 刻度标签垂直居中对齐刻度线

                        whrTicks.forEach(tickValue => {
                            const tickY = chartAreaY + chartAreaHeight - (tickValue / maxWhrValue) * chartAreaHeight;
                            // 绘制刻度线
                            ctx.beginPath();
                            ctx.moveTo(chartAreaX, tickY);
                            ctx.lineTo(chartAreaX - tickLength, tickY);
                            ctx.stroke();
                            // 绘制刻度标签 - 稍微向左移动更多
                            ctx.fillText(tickValue.toFixed(2), chartAreaX - tickLength - 5, tickY); // WHR 保留两位小数，调整 X 坐标
                        });


                        // 绘制 WHR 风险区域背景 (根据性别不同)
                         if (gender === 'male') {
                             // 男性风险较低: <= 0.9
                             ctx.fillStyle = 'rgba(40, 167, 69, 0.2)'; // 半透明绿色
                             const maleLowRiskHeight = (0.9 / maxWhrValue) * chartAreaHeight;
                             ctx.fillRect(chartAreaX, chartAreaY + chartAreaHeight - maleLowRiskHeight, chartAreaWidth, maleLowRiskHeight);

                             // 男性风险增加: > 0.9
                             ctx.fillStyle = 'rgba(220, 53, 69, 0.2)'; // 半透明红色
                              const maleHighRiskStartValue = 0.9;
                             const maleHighRiskHeight = (maxWhrValue - maleHighRiskStartValue) / maxWhrValue * chartAreaHeight;
                             ctx.fillRect(chartAreaX, chartAreaY + chartAreaHeight - (maleHighRiskStartValue / maxWhrValue) * chartAreaHeight - maleHighRiskHeight, chartAreaWidth, maleHighRiskHeight);

                         } else if (gender === 'female') {
                             //女性风险较低: <= 0.85
                             ctx.fillStyle = 'rgba(40, 167, 69, 0.2)'; // 半透明绿色
                             const femaleLowRiskHeight = (0.85 / maxWhrValue) * chartAreaHeight;
                             ctx.fillRect(chartAreaX, chartAreaY + chartAreaHeight - femaleLowRiskHeight, chartAreaWidth, femaleLowRiskHeight);

                             // 女性风险增加: > 0.85
                             ctx.fillStyle = 'rgba(220, 53, 69, 0.2)'; // 半透明红色
                             const femaleHighRiskStartValue = 0.85;
                             const femaleHighRiskHeight = (maxWhrValue - femaleHighRiskStartValue) / maxWhrValue * chartAreaHeight;
                             ctx.fillRect(chartAreaX, chartAreaY + chartAreaHeight - (femaleHighRiskStartValue / maxWhrValue) * chartAreaHeight - femaleHighRiskHeight, chartAreaWidth, femaleHighRiskHeight);
                         }


                        // 绘制代表用户 WHR 的标记线
                        const userWhrY = chartAreaY + chartAreaHeight - (whr / maxWhrValue) * chartAreaHeight;
                        ctx.strokeStyle = getWHRCategoryColor(whr, gender); // 使用分类颜色
                        ctx.lineWidth = 3; // 加粗标记线
                        // 确保标记线在图表区域内
                        if (userWhrY >= chartAreaY && userWhrY <= chartAreaY + chartAreaHeight) {
                            ctx.beginPath();
                            ctx.moveTo(chartAreaX, userWhrY);
                            ctx.lineTo(chartAreaX + chartAreaWidth, userWhrY);
                            ctx.stroke();

                            // 在标记线上方或旁边显示具体的 WHR 数值和分类
                            ctx.fillStyle = '#000';
                            ctx.font = '14px Arial bold';
                             // 尝试将文本绘制在标记线右侧的图例区域附近
                            ctx.textAlign = 'left';
                            ctx.textBaseline = 'bottom'; // 文本底部与标记线对齐

                            const textX = chartAreaX + chartAreaWidth + 5; // 文本的 X 坐标，在图表区域右侧
                            const textY = userWhrY - 2; // 文本的 Y 坐标，标记线上方一点

                            // 确保文本不会超出 Canvas 顶部或底部
                            const adjustedTextY = Math.max(chartAreaY + ctx.measureText('M').actualBoundingBoxAscent, Math.min(chartAreaY + chartAreaHeight, textY));


                        }


                        // 绘制图表标题
                        ctx.fillStyle = '#333';
                        ctx.font = '16px Arial bold';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'top';
                        ctx.fillText('腰臀比指数评估', canvasWidth / 2, 5);

                         // 添加 WHR 图例
                         const legendX = chartAreaX + chartAreaWidth + 10; // 图例的起始 X 坐标
                         let legendY = chartAreaY; // 图例的起始 Y 坐标
                         const legendColorSize = 15; // 图例颜色块大小
                         const legendTextSpacing = 5; // 颜色块和文字间距
                         const legendLineHeight = 20; // 图例行高

                         ctx.font = '12px Arial';
                         ctx.textAlign = 'left';
                         ctx.textBaseline = 'top';

                         // WHR 图例根据性别显示不同的分类名称
                         const whrCategories = gender === 'male' ? [
                              { name: '风险较低 (<=0.9)', color: getWHRCategoryColor(0.8, 'male') },
                              { name: '风险增加 (>0.9)', color: getWHRCategoryColor(1.0, 'male') }
                         ] : [
                              { name: '风险较低 (<=0.85)', color: getWHRCategoryColor(0.7, 'female') },
                              { name: '风险增加 (>0.85)', color: getWHRCategoryColor(0.9, 'female') }
                         ];

                         whrCategories.forEach(cat => {
                             ctx.fillStyle = cat.color;
                             ctx.fillRect(legendX, legendY, legendColorSize, legendColorSize);
                             ctx.fillStyle = '#333';
                             ctx.fillText(cat.name, legendX + legendColorSize + legendTextSpacing, legendY);
                             legendY += legendLineHeight;
                         });


                     } else {
                          // 如果 WHR 无效，Canvas 已经被清空
                          // 在 Canvas 区域显示“腰围/臀围无效”的文字提示
                          const canvasWidth = whrChartCanvas.width;
                          const canvasHeight = whrChartCanvas.height;
                          ctx.clearRect(0, 0, canvasWidth, canvasHeight); // 确保清空
                          ctx.fillStyle = '#888';
                          ctx.font = '14px Arial';
                          ctx.textAlign = 'center';
                          ctx.textBaseline = 'middle';
                          ctx.fillText('请填写腰围和臀围', canvasWidth / 2, canvasHeight / 2);
                     }
                }
            }


            // --- 辅助函数：根据分类返回颜色 ---
            // 保留之前为 Chart.js 编写的颜色获取函数，它们同样适用于 Canvas 绘制
            function getBMICategoryColor(bmi) {
                 if (isNaN(bmi)) return '#ccc'; // Default color (灰色)
                 if (bmi < 18.5) return '#0dcaf0'; // *** 修改偏瘦的颜色，例如改为浅蓝色 ***
                 if (bmi >= 18.5 && bmi < 24.9) return '#28a745'; // Green for normal (绿色)
                 if (bmi >= 24.9 && bmi < 29.9) return '#ffc107'; // Yellow/Orange for overweight (黄色/橙色)
                 if (bmi >= 29.9) return '#dc3545'; // Red for obese (红色)
                 return '#ccc';
            }

             function getWHRCategoryColor(whr, gender) {
                if (isNaN(whr)) return '#ccc'; // Default color
                if (gender === 'male') {
                    if (whr > 0.9) return '#dc3545'; // Red for high risk (male)
                    return '#28a745'; // Green for low risk (male)
                } else if (gender === 'female') {
                     if (whr > 0.85) return '#dc3545'; // Red for high risk (female)
                     return '#28a745'; // Green for low risk (female)
                }
                return '#ccc'; // Default if gender unknown or other
             }


            // TODO: 如果需要，在这里初始化或重置人体图的状态和监听 (这部分应该已经在上面的 UI 更新逻辑中根据 injuryStatus 完成了)


            // TODO: 下一步：实现“查看运动方案”按钮的点击逻辑 (已经完成初步，后续完善方案生成)
            // TODO: 下一步：实现模态框按钮的点击逻辑 (已经完成)
            // TODO: 下一步：实现侧边栏收起/展开按钮逻辑 (如果需要)

        });
    } else {
         console.error('User Input Form not found!'); // Log if form reference is null
    }


    // --- 7. 计算函数 (保持不变) ---

    function calculateBMI(weightKg, heightM) {
        if (heightM <= 0) return NaN; // Avoid division by zero
        return weightKg / (heightM * heightM);
    }

    function calculateWHR(waistCm, hipCm) {
        // Calculate only if both waist and hip are valid numbers
        // Corrected typo from previous versions: waastCm -> waistCm
        if (isNaN(waistCm) || isNaN(hipCm) || hipCm <= 0) {
            return NaN; // Return NaN if invalid or hip is zero
        }
        return waistCm / hipCm;
    }

    function calculateRecommendedWeightRange(heightM) {
         if (heightM <= 0) return { min: NaN, max: NaN };
         const minBMI = 18.5; // Normal BMI lower limit
         const maxBMI = 24.9; // Normal BMI upper limit

         const minWeight = minBMI * (heightM * heightM);
         const maxWeight = maxBMI * (heightM * heightM);

         // Return an object with min and max values, fixed to one decimal place
         return {
              min: parseFloat(minWeight.toFixed(1)), // Fixed to 1 decimal place
              max: parseFloat(maxWeight.toFixed(1)) // Fixed to 1 decimal place
         };
    }

    // --- 8. Assessment categorization functions (初步实现，需要更详细的标准) ---

    function getBMICategory(bmi) {
        if (isNaN(bmi)) return '';
        if (bmi < 18.5) return ' (偏瘦)';
        if (bmi >= 18.5 && bmi < 24.9) return ' (正常)';
        if (bmi >= 24.9 && bmi < 29.9) return ' (超重)';
        if (bmi >= 29.9) return ' (肥胖)'; // Obesity can be further categorized
        return '';
    }

    function getWHRCategory(whr, gender) {
        if (isNaN(whr)) return '';
        // Simplified standard, actual standards are more complex and vary by organization
        if (gender === 'male') {
            if (whr > 0.9) return ' (心血管风险增加)'; // Red for high risk (male)
            return ' (心血管风险较低)'; // Green for low risk (male)
        } else if (gender === 'female') {
             if (whr > 0.85) return ' (心血管风险增加)'; // Red for high risk (female)
             return ' (心血管风险较低)'; // Green for low risk (female)
        }
        return ''; // Default if gender unknown or other
    }


    // --- 9. 监听“查看运动方案”按钮点击事件 (保持不变) ---
    // Check if button element exists before adding listener
    if(viewPlanButton) {
        viewPlanButton.addEventListener('click', () => {
            console.log('--- View Plan button clicked ---'); // Add log
            // TODO: Get all assessment data here (including injured parts list, after implementing body map interaction)
            // For now, use available data and placeholders
            const assessmentData = {
                age: parseInt(ageInput.value),
                gender: genderSelect.value,
                heightCm: parseFloat(heightInput.value),
                weightKg: parseFloat(weightInput.value),
                exerciseLevel: exerciseLevelSelect.value,
                injuryStatus: document.querySelector('input[name="injury-status"]:checked').value,
                // TODO: Injured parts list will be obtained here, currently empty
                injuredParts: [],
                // TODO: WHR data etc. can also be passed if needed
            };

            // Call the function to generate the exercise plan
            // generateExercisePlan function will return a preliminary plan text based on this data
            const generatedPlanText = generateExercisePlan(assessmentData);

            // Show exercise plan section
            if(exercisePlanSection) exercisePlanSection.style.display = 'block'; // Use your CSS display value


            // Get element to display plan content
            const planContentElement = document.getElementById('plan-content');
            if(planContentElement) {
                 // Fill the plan content area with the generated plan text
                // Use textContent to prevent HTML injection, if the plan content is plain text
                planContentElement.textContent = generatedPlanText;
            } else {
                 console.error('Plan content element not found!'); // If element is null
            }


            // TODO: If body map marking is implemented, display the list of marked injured parts here
            // const markedInjuriesDisplay = document.getElementById('marked-injuries-display');
            // If assessmentData.injuredParts array is not empty, update markedInjuriesDisplay content
            // if(markedInjuriesDisplay) markedInjuriesDisplay.style.display = assessmentData.injuredParts.length > 0 ? 'block' : 'none'; // Control visibility
            // const markedInjuriesListElement = markedInjuriesDisplay.querySelector('ul');
            // if(markedInjuriesListElement) markedInjuriesListElement.innerHTML = ''; // Clear list
            // assessmentData.injuredParts.forEach(part => {
            //     const li = document.createElement('li');
            //     li.textContent = part;
            //     markedInjuriesListElement.appendChild(li);
            // });

        });
    } else {
         console.error('View Plan Button not found!'); // If element is null
    }


    // --- 10. 运动方案生成函数 (根据所有评估数据生成详细方案) ---
    function generateExercisePlan(data) {
        let planText = `--- 您的个性化运动方案 ---\n\n`; // 方案开头加上昵称

        // 1. 基础信息总结 (可选)
        planText += `评估总结：\n`;
        planText += `- 性别: ${data.gender === 'male' ? '男' : (data.gender === 'female' ? '女' : '其他')}\n`;
        planText += `- 年龄: ${data.age} 岁\n`;
        if (!isNaN(data.heightCm) && !isNaN(data.weightKg)) {
             const bmi = calculateBMI(data.weightKg, data.heightCm / 100); // 确保在函数内重新计算 BMI
             planText += `- BMI: ${isNaN(bmi) ? '无效' : bmi.toFixed(1) + getBMICategory(bmi)}\n`;
        }
         if (!isNaN(data.waistCm) && !isNaN(data.hipCm)) {
             const whr = calculateWHR(data.waistCm, data.hipCm); // 确保在函数内重新计算 WHR
              planText += `- 腰臀比 (WHR): ${isNaN(whr) ? '无效' : whr.toFixed(2) + getWHRCategory(whr, data.gender)}\n`;
         }
        planText += `- 运动水平: ${data.exerciseLevel === 'sedentary' ? '久坐不动' : (data.exerciseLevel === 'light' ? '偶尔运动' : (data.exerciseLevel === 'moderate' ? '每周1-3次' : (data.exerciseLevel === 'active' ? '每周3-5次' : (data.exerciseLevel === 'very-active' ? '每周5+次' : '未选择'))))}\n`;
        planText += `- 伤病史: ${data.injuryStatus === 'yes' ? '有' : '无'}\n`;

        planText += "\n--- 运动建议 ---\n\n";


        // 2. 根据 BMI 分类给出更详细的建议
        if (!isNaN(data.heightCm) && !isNaN(data.weightKg)) {
            const bmi = calculateBMI(data.weightKg, data.heightCm / 100);
            const bmiCategory = getBMICategory(bmi);

            planText += `您的 BMI (${isNaN(bmi) ? '无效' : bmi.toFixed(1)}) 属于 ${bmiCategory.trim()}。针对您的 BMI，建议如下：\n`;

            if (bmi < 18.5) { // 偏瘦
                planText += `- 目标： 增加体重，主要是肌肉量。\n`;
                planText += `- 运动类型：\n`;
                planText += `  - 力量训练： 每周 2-3 次全身力量训练，重点关注复合动作（如深蹲、硬拉、卧推、划船），使用能完成 8-12 次的重量，每组 3-4 组。\n`;
                planText += `  - 有氧运动： 每周 1-2 次低到中等强度的有氧运动（如快走、慢跑、骑自行车），每次 20-30 分钟，不宜过多以免消耗过多热量。\n`;
                planText += `- 注意事项： 确保高蛋白、高热量饮食，特别是在训练后摄入。\n`;
            } else if (bmi >= 18.5 && bmi < 24.9) { // 正常
                planText += `- 目标： 保持健康体重和身体素质。\n`;
                planText += `- 运动类型：\n`;
                planText += `  - 综合训练： 结合有氧运动和力量训练。\n`;
                planText += `  - 有氧运动： 每周 3-5 次中等强度有氧运动，每次 30-60 分钟（如跑步、游泳、球类运动），或每周 3 次高强度间歇训练 (HIIT)。\n`;
                planText += `  - 力量训练： 每周 2-3 次全身或分部位力量训练，可根据个人喜好选择训练方式（如自重训练、器械训练、自由重量）。\n`;
                planText += `- 注意事项： 保持饮食均衡，可以根据运动量调整能量摄入。\n`;
            } else if (bmi >= 24.9 && bmi < 29.9) { // 超重
                planText += `- 目标： 减轻体重，减少体脂。\n`;
                planText += `- 运动类型：\n`;
                planText += `  - 有氧运动： 优先进行中低强度的有氧运动，每周至少 150 分钟（如快走、椭圆机、游泳），逐步增加时长和频率。也可以尝试高强度间歇训练以提高燃脂效率。\n`;
                planText += `  - 力量训练： 每周 2-3 次全身力量训练，有助于维持肌肉量和提高代谢率，可以结合较高的重复次数。\n`;
                planText += `- 注意事项： 运动前充分热身，选择对关节冲击较小的运动。控制总热量摄入，特别是减少高糖、高脂食物。\n`;
            } else if (bmi >= 29.9) { // 肥胖
                 planText += `- 目标： 显著减轻体重，改善健康状况。\n`;
                 planText += `- 运动类型：\n`;
                 planText += `  - 有氧运动： 重点！从低强度运动开始（如快走、水中行走、慢速椭圆机），每周多次，每次争取达到 30-60 分钟。运动强度逐步提高，但避免高强度运动初期对关节的压力。\n`;
                 planText += `  - 力量训练： 每周 2-3 次全身力量训练，有助于改善身体成分和代谢。可以从自重训练或低重量器械开始。\n`;
                 planText += `- 注意事项： 强烈建议在医生或专业教练指导下开始运动计划。 极度重视运动前热身和运动后拉伸，选择对关节压力小的运动。配合严格的饮食控制。\n`;
            }
        } else {
            planText += "请填写有效的身高和体重以获得基于 BMI 的运动建议。\n";
        }

         planText += "\n"; // 分隔线


        // 3. 根据 WHR 评估心血管风险，调整有氧运动强度和时长建议
         if (!isNaN(data.waistCm) && !isNaN(data.hipCm)) {
            const whr = calculateWHR(data.waistCm, data.hipCm);
            const whrCategory = getWHRCategory(whr, data.gender);

            if (!isNaN(whr)) {
                 planText += `您的腰臀比 (${whr.toFixed(2)}) 属于 ${whrCategory.trim()}。\n`;
                 if (whrCategory.includes('风险增加')) {
                     planText += `- 特别建议： 鉴于心血管风险增加，请特别重视规律的有氧运动。目标是每周进行至少 150 分钟中等强度或 75 分钟高强度有氧运动，并逐步增加时长。\n`;
                     planText += `- 运动选择： 快走、慢跑、游泳、骑行、跳舞等都是不错的选择。\n`;
                 } else {
                      planText += `- 保持规律的有氧运动有助于维持心血管健康。\n`;
                 }
            } else {
                 planText += "请填写有效的腰围和臀围以获得基于 WHR 的运动建议。\n";
            }
         }


         planText += "\n"; // 分隔线


        // 4. 根据运动水平调整训练量建议 (可选)
        planText += `根据您的运动水平 (${data.exerciseLevel === '' ? '未选择' : data.exerciseLevel})，以下是进一步建议：\n`;
        if (data.exerciseLevel === 'sedentary') {
             planText += `- 起步： 从每天增加活动量开始，例如增加步行，尝试短时间的低强度运动。\n`;
             planText += `- 目标： 逐步适应，增加运动频率和时长。\n`;
        } else if (data.exerciseLevel === 'light') {
             planText += `- 起步：尝试建立每周固定的运动日，例如每周 2-3 次。\n`;
             planText += `- 目标： 逐渐增加每次运动的时长和强度。\n`;
        } else if (data.exerciseLevel === 'moderate') {
             planText += `- 保持： 继续保持每周 1-3 次的运动习惯。\n`;
             planText += `- 提升： 可以尝试提高运动强度，或者挑战新的运动项目。\n`;
        } else if (data.exerciseLevel === 'active') {
             planText += `- 保持： 您的运动习惯良好，继续保持。\n`;
             planText += `- 提升： 可以考虑更系统的训练计划，或者尝试参加运动赛事。\n`;
        } else if (data.exerciseLevel === 'very-active') {
             planText += `- 保持： 您是运动达人！请确保充分的恢复和营养，避免过度训练和伤病。\n`;
             planText += `- 提升： 可以专注于提升特定运动项目的表现。\n`;
        } else {
             planText += "- 请选择运动水平以获得更个性化建议。\n";
        }

         planText += "\n"; // 分隔线

        // 5. 根据年龄和性别给出补充建议 (可选，更详细的建议需要更多专业知识)
        planText += `针对您的年龄 (${data.age} 岁) 和性别，补充建议：\n`;
         if (data.age >= 40) {
             planText += `- 注意： 运动前进行更充分的热身，运动过程中关注身体反应，运动后拉伸。\n`;
             planText += `- 建议： 结合保持骨骼健康的运动，如步行、慢跑或力量训练。\n`;
             if (data.gender === 'female') {
                 planText += `- 女性特定： 关注骨密度，重视力量训练。\n`;
             }
         } else if (data.age >= 18 && data.age < 40) {
              planText += `- 建议： 这是提高体能的黄金时期，可以更积极地进行各种运动挑战。\n`;
         } else { // 年龄较小或无效
             planText += `- 请填写有效年龄。\n`;
         }
        // 6. 根据伤病情况调整建议 (TODO: 需要人体图数据)
        // 这部分逻辑我们暂时保留，等待人体图功能实现后补充具体伤病部位的建议
        if (data.injuryStatus === 'yes') {
            if (data.injuredParts && data.injuredParts.length > 0) {
                 planText += "\n考虑到您标记的伤病部位 (" + data.injuredParts.join(', ') + ")：\n";
                 planText += `- 重要提示： 在进行运动前，强烈建议您咨询医生或专业的物理治疗师/健身教练。\n`;
                 planText += `- 请选择对受影响部位负荷较小的运动，避免加重伤病。\n`;
                 // TODO: 根据具体的伤病部位给出更详细的建议 (例如，膝盖伤避开跳跃，肩伤避开高举过头顶的动作)
            } else {
                 // 如果选择了有伤病史但未标记部位，提示用户标记
                 planText += "\n您选择了有伤病史，请在人体图上标记具体部位以获得更准确的运动建议。\n";
            }
        }


        planText += "\n--- 免责声明 ---\n";
        planText += "此运动方案是基于您提供的信息生成的初步建议，不应替代专业的医疗或健身指导。在开始任何新的运动计划前，特别是有伤病史或慢性疾病的情况下，请务必咨询医生或专业健身教练的意见。请根据个人感受调整运动强度和方式，避免不适或伤病。";

        return planText; // 返回生成的方案文本
    }


    // --- 11. 人体图交互 ---
    const humanBodyMapSVG = document.getElementById('human-body-map'); // 确保获取到 SVG 元素
    // 检查 marked-injuries-display 和其内部的 ul 元素是否存在
    const markedInjuriesDisplayElement = document.getElementById('marked-injuries-display');
    const markedInjuriesList = markedInjuriesDisplayElement ? markedInjuriesDisplayElement.querySelector('ul') : null;
    let currentMarkedInjuries = []; // 存储已标记的伤病部位名称数组

    // 为 humanBodyMapSVG 添加点击事件监听
    // 确保 SVG 元素和显示列表元素都成功获取到了
    if(humanBodyMapSVG && markedInjuriesList) {
         console.log('Human body map SVG and marked injuries list found. Adding click listener.'); // 添加日志
         humanBodyMapSVG.addEventListener('click', (event) => {
             console.log('--- Human body map clicked ---'); // 记录点击事件
             console.log('Clicked element:', event.target); // *** 打印被点击的元素 ***

             // TODO: 下一步：判断被点击的元素是否是身体部位，并获取其标识
             // 例如，如果你的身体部位在 SVG 中是 <path> 或其他带有特定类名/ID 的元素
             const clickedElement = event.target;
             // 简单的例子：如果点击的是一个 path 元素，并且它不是 SVG 本身或背景
             if (clickedElement.tagName === 'path' && clickedElement !== humanBodyMapSVG) {
                  const partId = clickedElement.id || clickedElement.getAttribute('data-part-name'); // 尝试获取 ID 或自定义属性作为部位名称
                  if (partId) {
                       console.log('Potential body part clicked:', partId);

                       // TODO: 实现标记逻辑 - 例如，添加到 currentMarkedInjuries 数组并更新页面列表
                       // if (!currentMarkedInjuries.includes(partId)) {
                       //     currentMarkedInjuries.push(partId);
                       //     console.log('Marked injuries:', currentMarkedInjuries);
                           // 更新页面列表显示
                       //    if (markedInjuriesList) {
                       //        const listItem = document.createElement('li');
                       //        listItem.textContent = partId;
                       //        markedInjuriesList.appendChild(listItem);
                       //    }
                           // TODO: 在 SVG 上给该部位添加视觉标记 (例如改变颜色或添加标记元素)
                       //    clickedElement.style.fill = 'red'; // 示例：将点击的 path 填充为红色
                       // } else {
                           // TODO: 如果已经标记，可以实现取消标记的逻辑
                       //    console.log('Body part already marked.');
                       // }
                  } else {
                      console.log('Clicked element is a path, but no part ID or data-part-name found.');
                  }
             } else if (clickedElement.tagName === 'svg') {
                 console.log('Clicked on the SVG background, not a body part.');
             } else {
                 console.log('Clicked element is not a path or SVG background:', clickedElement.tagName);
             }
         });
    } else {
        console.error('Human body map SVG element or marked injuries list not found!');
    }

    // TODO: 在点击“进行评估”按钮时，获取 currentMarkedInjuries 数组并传递给 generateExercisePlan 函数 (在 submit 监听器中实现)
    // 这个 TODO 已经在 submit 监听器中有了，需要在这里实际获取 currentMarkedInjuries 并传递

    // TODO: 在页面上显示 currentMarkedInjuries 数组中的部位列表 (在 submit 监听器或单独的更新函数中实现)
    // 上面的代码中已经包含添加到列表的初步逻辑，可以完善

    // ... (模态框控制等后续代码，保持不变) ...

    // --- 12. Modal control ---
    // Get references to modal elements, top-right buttons, and close buttons
    const dietModal = document.getElementById('modal-diet');
    const calorieModal = document.getElementById('modal-calorie');
    const btnDietRef = document.getElementById('btn-diet-ref');
    const btnCalorieCalc = document.getElementById('btn-calorie-calc');
    // Query all close buttons within elements that have the 'modal' class
    const closeButtons = document.querySelectorAll('.modal .close-button');


    // Log elements obtained to check if they are null
    console.log('Modal elements obtained (check for null):', {
        dietModal, // Should be an element object or null
        calorieModal, // Should be an element object or null
        btnDietRef, // Should be a button element object or null
        btnCalorieCalc, // Should be a button element object or null
        closeButtons: closeButtons ? closeButtons.length : null // Log length or null
    });

    // Show modal function
    function showModal(modalElement) {
        console.log('--- Attempting to show modal ---', modalElement);
        if (modalElement) { // Check if element exists
            modalElement.style.display = 'block'; // Use your CSS display value (e.g., flex or block)
            console.log('--- Modal display set to block ---');
            console.log('Current display style:', modalElement.style.display);
             // Optional: Check computed style *after* setting (sometimes helps diagnose CSS overrides)
            const computedStyle = window.getComputedStyle(modalElement);
            console.log('Computed display style:', computedStyle.display);
        } else {
            console.error('showModal called with null or undefined element!');
        }
    }

    // Hide modal function
    function hideModal(modalElement) {
         console.log('--- Attempting to hide modal ---', modalElement);
         if (modalElement) { // Check if element exists
            modalElement.style.display = 'none'; // Use your CSS display value
            console.log('--- Modal display set to none ---');
         } else {
             console.error('hideModal called with null or undefined element!');
         }
    }


    // Add click event listeners to right-top buttons to show corresponding modals
    // Check if buttons exist before adding listeners
    if(btnDietRef) {
        btnDietRef.addEventListener('click', () => {
            console.log('Diet button clicked');
            showModal(dietModal);
        });
    } else {
        console.error('Diet Reference Button not found!');
    }

    if(btnCalorieCalc) {
        btnCalorieCalc.addEventListener('click', () => {
            console.log('Calorie button clicked');
            showModal(calorieModal);
        });
    } else {
        console.error('Calorie Button not found!');
    }


    // Add click event listeners to all modal close buttons to hide corresponding modals
    if(closeButtons && closeButtons.length > 0) {
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                console.log('Close button clicked');
                // Use closest('.modal') to find the nearest parent modal element
                const modalElement = button.closest('.modal');
                if(modalElement) {
                     hideModal(modalElement);
                } else {
                    console.error('Close button found, but parent modal not found!');
                }
            });
        });
    } else {
         console.warn('No close buttons found in modals.'); // Log if no close buttons
    }


    // Hide modal when clicking outside (optional)
    window.addEventListener('click', (event) => {
        // If the clicked element has the 'modal' class (i.e., the background overlay)
        if (event.target.classList && event.target.classList.contains('modal')) { // Check if classList exists
             console.log('Clicked outside modal');
             // Hide the clicked modal element itself
             hideModal(event.target);
        }
    });


    // --- 13. Sidebar toggle (TODO) ---
    // ...


}); // DOMContentLoaded ends