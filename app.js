// Application Logic for Wemade PC Efficiency App

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const modelSearch = document.getElementById('modelSearch');
    const clearSearch = document.getElementById('clearSearch');
    const autocompleteList = document.getElementById('autocompleteList');
    const modelList = document.getElementById('modelList');
    const modelCount = document.getElementById('modelCount');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // Details Elements
    const detailsPlaceholder = document.getElementById('detailsPlaceholder');
    const detailsCard = document.getElementById('detailsCard');
    
    const detailGen = document.getElementById('detailGen');
    const detailModelName = document.getElementById('detailModelName');
    const detailGrade = document.getElementById('detailGrade');
    const detailCompany = document.getElementById('detailCompany');
    const detailDate = document.getElementById('detailDate');
    
    const compSummaryBox = document.getElementById('compSummaryBox');
    const compIcon = document.getElementById('compIcon');
    const compTitle = document.getElementById('compTitle');
    const compDescription = document.getElementById('compDescription');
    
    const valTec = document.getElementById('valTec');
    const fillTec = document.getElementById('fillTec');
    const markerTecAvg = document.getElementById('markerTecAvg');
    const compTecPercent = document.getElementById('compTecPercent');
    
    const valCost = document.getElementById('valCost');
    const valCo2 = document.getElementById('valCo2');
    
    const valIdle = document.getElementById('valIdle');
    const circleIdle = document.getElementById('circleIdle');
    
    const valSleep = document.getElementById('valSleep');
    const valSleepTime = document.getElementById('valSleepTime');
    const circleSleep = document.getElementById('circleSleep');
    
    const valOff = document.getElementById('valOff');
    const circleOff = document.getElementById('circleOff');
    
    const tableReceiptNum = document.getElementById('tableReceiptNum');
    const tableBizNum = document.getElementById('tableBizNum');
    const tableClass = document.getElementById('tableClass');
    const tableType = document.getElementById('tableType');
    
    // State variables
    let currentGenFilter = 'all';
    let currentSearchQuery = '';
    let selectedModel = null;

    // Initialize the App
    function init() {
        renderModelList();
        setupEventListeners();
        
        // Auto-select first item if available
        const firstItem = modelList.querySelector('.model-item');
        if (firstItem) {
            firstItem.click();
        }
    }

    // Event Listeners Setup
    function setupEventListeners() {
        // Search Input
        modelSearch.addEventListener('input', (e) => {
            currentSearchQuery = e.target.value.trim().toLowerCase();
            toggleClearButton();
            renderAutocomplete();
            renderModelList();
        });

        // Clear Search Button
        clearSearch.addEventListener('click', () => {
            modelSearch.value = '';
            currentSearchQuery = '';
            toggleClearButton();
            autocompleteList.style.display = 'none';
            renderModelList();
            modelSearch.focus();
        });

        // Filter Buttons
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentGenFilter = btn.dataset.gen;
                renderModelList();
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!modelSearch.contains(e.target) && !autocompleteList.contains(e.target)) {
                autocompleteList.style.display = 'none';
            }
        });
    }

    // Toggle Clear Button Visibility
    function toggleClearButton() {
        if (modelSearch.value.length > 0) {
            clearSearch.style.display = 'block';
        } else {
            clearSearch.style.display = 'none';
        }
    }

    // Filter and Sort Data
    function getFilteredData() {
        return pcData.filter(item => {
            const matchesGen = currentGenFilter === 'all' || item.Generation === currentGenFilter;
            const matchesSearch = item.모델명.toLowerCase().includes(currentSearchQuery) || 
                                  item.Filename.toLowerCase().includes(currentSearchQuery);
            return matchesGen && matchesSearch;
        }).sort((a, b) => a.모델명.localeCompare(b.모델명));
    }

    // Render Model List (Left panel)
    function renderModelList() {
        const filtered = getFilteredData();
        modelCount.textContent = filtered.length;
        
        modelList.innerHTML = '';
        
        if (filtered.length === 0) {
            modelList.innerHTML = `<div class="placeholder-text card" style="text-align: center; color: var(--color-text-dim); padding: 2rem;">검색 결과가 없습니다.</div>`;
            return;
        }
        
        filtered.forEach(item => {
            const isSelected = selectedModel && selectedModel.모델명 === item.모델명;
            const itemEl = document.createElement('div');
            itemEl.className = `model-item ${isSelected ? 'active' : ''}`;
            itemEl.innerHTML = `
                <div class="model-item-header">
                    <span class="model-item-name">${item.모델명}</span>
                    <span class="model-item-gen" data-gen="${item.Generation}">${item.Generation}</span>
                </div>
                <div class="model-item-details">
                    <span>TEC: <span class="model-item-tec">${item["TEC소비전력량(kWh)"]} kWh</span></span>
                    <span>대기: ${item["오프소비전력(W)"]} W</span>
                </div>
            `;
            
            itemEl.addEventListener('click', () => {
                // Remove active class from previous
                const activeItem = modelList.querySelector('.model-item.active');
                if (activeItem) activeItem.classList.remove('active');
                
                // Add active to current
                itemEl.classList.add('active');
                
                // Set state
                selectedModel = item;
                
                // Show details
                showDetails(item);
            });
            
            modelList.appendChild(itemEl);
        });
    }

    // Render Autocomplete Dropdown
    function renderAutocomplete() {
        if (!currentSearchQuery) {
            autocompleteList.style.display = 'none';
            return;
        }
        
        const matches = pcData.filter(item => 
            item.모델명.toLowerCase().includes(currentSearchQuery)
        ).slice(0, 8); // limit to 8 suggestions
        
        if (matches.length === 0) {
            autocompleteList.style.display = 'none';
            return;
        }
        
        autocompleteList.innerHTML = '';
        matches.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'autocomplete-item';
            itemEl.innerHTML = `
                <span class="ac-model">${item.모델명}</span>
                <span class="ac-gen">${item.Generation}</span>
            `;
            
            itemEl.addEventListener('click', () => {
                modelSearch.value = item.모델명;
                currentSearchQuery = item.모델명.toLowerCase();
                toggleClearButton();
                autocompleteList.style.display = 'none';
                
                // Filter generation and search lists
                renderModelList();
                
                // Click the selected item in the list
                const listItems = modelList.querySelectorAll('.model-item');
                for (let li of listItems) {
                    if (li.querySelector('.model-item-name').textContent === item.모델명) {
                        li.click();
                        li.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                        break;
                    }
                }
            });
            
            autocompleteList.appendChild(itemEl);
        });
        
        autocompleteList.style.display = 'block';
    }

    // Update Detail Card Panel (Right panel)
    function showDetails(item) {
        detailsPlaceholder.style.display = 'none';
        detailsCard.style.display = 'flex';
        
        // Basic Info
        detailModelName.textContent = item.모델명;
        detailGen.textContent = item.Generation;
        detailGen.className = 'badge-gen';
        detailGen.setAttribute('data-gen', item.Generation);
        
        detailGrade.textContent = item.효율등급;
        detailCompany.textContent = item.업체명 || '위메이드 보호작업장';
        detailDate.textContent = item.신고일자 || '-';
        
        // Averages comparison
        const avg = genAverages[item.Generation] || { TEC: 110.0, 롱아이들: 31.0, 슬립: 1.0, 오프: 0.5 };
        const modelTec = item["TEC소비전력량(kWh)"];
        
        // Calculate efficiency percent diff
        // (Less TEC is better)
        const percentDiff = ((modelTec - avg.TEC) / avg.TEC) * 100;
        const absDiff = Math.abs(percentDiff).toFixed(1);
        
        if (percentDiff <= 0) {
            // Efficient model
            compSummaryBox.className = 'comparison-summary';
            compIcon.textContent = '📈';
            compTitle.textContent = '우수한 에너지 효율 모델';
            compDescription.innerHTML = `이 모델은 동일한 <strong>${item.Generation}</strong> 데스크톱 평균 연간 소비량(<strong>${avg.TEC.toFixed(1)} kWh</strong>) 대비 <strong style="color: var(--color-success); font-size: 1.05rem;">${absDiff}% 더 적은 전력</strong>을 사용하여 친환경적입니다.`;
            compTecPercent.textContent = `-${absDiff}%`;
            compTecPercent.className = 'comp-percent-label better';
            
            fillTec.className = 'progress-bar-fill';
        } else {
            // Less efficient model
            compSummaryBox.className = 'comparison-summary worse';
            compIcon.textContent = '⚠️';
            compTitle.textContent = '평균 대비 전력 소모량 높음';
            compDescription.innerHTML = `이 모델은 동일한 <strong>${item.Generation}</strong> 데스크톱 평균 연간 소비량(<strong>${avg.TEC.toFixed(1)} kWh</strong>) 대비 <strong style="color: var(--color-warning); font-size: 1.05rem;">${absDiff}% 더 많은 전력</strong>을 소비합니다.`;
            compTecPercent.textContent = `+${absDiff}%`;
            compTecPercent.className = 'comp-percent-label worse';
            
            fillTec.className = 'progress-bar-fill worse';
        }
        
        // Update TEC main metrics card
        valTec.textContent = modelTec.toFixed(1);
        
        // Progress bar positioning (limit range between 50 and 230 kWh)
        const maxVal = 220;
        const fillPercent = Math.min(100, Math.max(0, (modelTec / maxVal) * 100));
        const avgPercent = Math.min(100, Math.max(0, (avg.TEC / maxVal) * 100));
        
        fillTec.style.width = `${fillPercent}%`;
        markerTecAvg.style.left = `${avgPercent}%`;
        
        // Annual Cost
        const costVal = item["연간에너지비용(원)"];
        valCost.textContent = costVal ? costVal.toLocaleString() : '-';
        
        // CO2 emissions
        const co2Val = item["연간CO2배출량(kg)"];
        valCo2.textContent = co2Val ? co2Val.toFixed(1) : '-';
        
        // Standby Power Gauges (SVG animations)
        // 1. Long Idle (Max 70W)
        const idleVal = item["롱아이들소비전력(W)"];
        if (idleVal !== null) {
            valIdle.textContent = idleVal.toFixed(1);
            setGaugeOffset(circleIdle, idleVal, 70);
        } else {
            valIdle.textContent = '-';
            circleIdle.style.strokeDashoffset = 251.2;
        }
        
        // 2. Sleep Power (Max 3.0W)
        const sleepVal = item["슬립소비전력(W)"];
        if (sleepVal !== null) {
            valSleep.textContent = sleepVal.toFixed(1);
            setGaugeOffset(circleSleep, sleepVal, 3.0);
            valSleepTime.textContent = `이행: ${item["슬립이행시간(분)"]}분`;
        } else {
            valSleep.textContent = '-';
            circleSleep.style.strokeDashoffset = 251.2;
            valSleepTime.textContent = '';
        }
        
        // 3. Off Power (Max 1.5W)
        const offVal = item["오프소비전력(W)"];
        if (offVal !== null) {
            valOff.textContent = offVal.toFixed(2);
            setGaugeOffset(circleOff, offVal, 1.5);
        } else {
            valOff.textContent = '-';
            circleOff.style.strokeDashoffset = 251.2;
        }
        
        // Hardware Table details
        tableReceiptNum.textContent = item.접수번호 || '-';
        tableBizNum.textContent = item.업체대표번호 || '525-82-00408';
        tableClass.textContent = item.컴퓨터분류 || 'Desktop';
        tableType.textContent = `${item.컴퓨터유형 || 'D'} 유형 (고성능)`;
        
        // Trigger page scroll/animation reset on target card
        detailsCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Helper to calculate SVG gauge stroke offset
    function setGaugeOffset(circleElement, value, maxVal) {
        const circumference = 251.2; // 2 * Math.PI * 40
        const percentage = Math.min(100, Math.max(0, value / maxVal));
        const offset = circumference - (circumference * percentage);
        circleElement.style.strokeDashoffset = offset;
    }

    // Run Initialization
    init();
});
