// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, get, ref, push, set, onValue, remove, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  databaseURL: "https://doantkll-73b19-default-rtdb.firebaseio.com",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const submitEl = document.getElementById("submit");
var devIdEl = document.getElementById("devId");
var errorSubmitEl = document.getElementById("errorSubmit");

if (submitEl) {
  submitEl.addEventListener("click", function(event) {
    let temp = devIdEl.value;
    if (temp == '') {
      errorSubmitEl.innerHTML = 'Vui lòng điền device ID.';
      return;
    }
    const pathRef = ref(db, temp);

    get(pathRef).then((snapshot) => {
      const exists = snapshot.exists();
      if (exists) {
        event.preventDefault();
        const url = "/User_manage.html?devId=" + encodeURIComponent(temp);
        window.location.href = url;
      } else {
        errorSubmitEl.innerHTML = "Không tồn tại thiết bị" + ` ${temp} ` + "trong Firebase Database.";
      }
    })
      .catch((error) => {
        console.error("Đã xảy ra lỗi:", error);
      });
  })
}



const addButton = document.getElementById("addButton");
const popup = document.getElementById("popup");
const nameInput = document.getElementById("nameInput");
const insertButton = document.getElementById("insertButton");
const closeButton = document.getElementById("closeButton");
const itemsContainer = document.getElementById("itemsContainer");
const dupliEl = document.getElementById("duplicate");

let itemId = 1;

if (addButton) {
  let queryString = window.location.search;
  let urlParams = new URLSearchParams(queryString);
  let devId = urlParams.get("devId");

  popup.style.display = "none";
  addButton.addEventListener("click", function() {
    popup.style.display = "block";
  });

  if (devId) {
    const pathRef = ref(db, devId);
    get(pathRef).then((snapshot) => {
      const exists = snapshot.exists();
      if (exists) {
        const obj = snapshot.val();
        for (let key in obj) {
          if (key !== "SpO2" && key !== "beat") {
            const kRef = ref(db, `${devId}/${key}`);

            const item = document.createElement("p");
            item.className = "item";
            item.textContent = key;

            const buttons = document.createElement("div");
            buttons.className = "buttons";

            const useButton = document.createElement("button");
            useButton.className = "button";
            useButton.textContent = "Use";

            useButton.addEventListener("click", function() {
              const url = "/Homepage.html?devId=" + encodeURIComponent(devId) + "&user=" + encodeURIComponent(key);
              window.location.href = url;
            });
            buttons.appendChild(useButton);

            // Tạo nút "Delete"
            const deleteButton = document.createElement("button");
            deleteButton.className = "button";
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener("click", function() {
              itemsContainer.removeChild(item);
              remove(kRef);
              --itemId;
            });
            buttons.appendChild(deleteButton);

            item.appendChild(buttons);

            itemsContainer.appendChild(item);
            itemId++;
          }
        }
      } else {
        console.log("xem lai");
      }
    })
      .catch((error) => {
        console.error("Đã xảy ra lỗi:", error);
      });
  }

  if (insertButton) {
    insertButton.addEventListener("click", function() {
      // Tạo một ô mới
      // console.log(itemId);
      const name = nameInput.value;
      const nameRef = ref(db, `${devId}/${name}`);
      console.log(`${devId}/${name}`);

      get(nameRef).then((snapshot) => {
        const exists = snapshot.exists();
        console.log(exists);
        if (exists) {
          dupliEl.innerHTML = "User đã tồn tại";
        } 
        else {
          dupliEl.innerHTML = "";
          if (name) {
            const item = document.createElement("p");
            item.className = "item";
            item.textContent = name;

            const buttons = document.createElement("div");
            buttons.className = "buttons";
            
            const useButton = document.createElement("button");
            useButton.className = "button";
            useButton.textContent = "Use";

            useButton.addEventListener("click", function() {
              const url = "/Homepage.html?devId=" + encodeURIComponent(devId) + "&user=" + encodeURIComponent(name);
              window.location.href = url;
            });
            buttons.appendChild(useButton);

            // Tạo nút "Delete"
            const deleteButton = document.createElement("button");
            deleteButton.className = "button";
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener("click", function() {
              itemsContainer.removeChild(item);
              remove(nameRef);
              --itemId;
            });
            buttons.appendChild(deleteButton);

            item.appendChild(buttons);

            itemsContainer.appendChild(item);
            popup.style.display = "none";
            nameInput.value = "";
            itemId++;
          }

          set(nameRef, {
            history: ""
          });
        }
      });

      

    });
  }

  if (closeButton) {
    closeButton.addEventListener("click", function() {
      popup.style.display = "none";
    });
  }

}

const userManageButtonEl = document.getElementById("userManageButton");
const measureButtonEl = document.getElementById("measureButton");
const historyButtonEl = document.getElementById("historyButton");
const logOutButtonEl = document.getElementById("logOutButton");

if (userManageButtonEl && measureButtonEl && historyButtonEl && logOutButtonEl) {
  let queryString = window.location.search;
  let urlParams = new URLSearchParams(queryString);
  let user = urlParams.get("user");
  let devId = urlParams.get("devId");

  userManageButtonEl.addEventListener("click", function() {
    let url = "/User_manage.html?devId=" + encodeURIComponent(devId);
    window.location.href = url;
  });

  measureButtonEl.addEventListener("click", function() {
    let url = "/Measure.html?devId=" + encodeURIComponent(devId);
    url += "&user=" + encodeURIComponent(user);
    window.location.href = url;
  });

  historyButtonEl.addEventListener("click", function() {
    let url = "/History.html?devId=" + encodeURIComponent(devId);
    url += "&user=" + encodeURIComponent(user);
    window.location.href = url;
  });

  logOutButtonEl.addEventListener("click", function() {
    let url = "/";
    window.location.href = url;
  });
}

const tableContainer = document.getElementById('tableContainer');
const clearButton = document.getElementById('clearButton');

if (tableContainer && clearButton) {
  // function resizePopup() {
  //   const contentWidth = tableContainer.offsetWidth;
  //   const maxWidth = window.innerWidth * 0.8; // Tùy chỉnh tỷ lệ tối đa của độ rộng
  //   const newWidth = Math.min(contentWidth, maxWidth);
  //   popup.style.maxWidth = newWidth + 'px';
  // }

  // window.addEventListener('resize', resizePopup);

  let queryString = window.location.search;
  let urlParams = new URLSearchParams(queryString);
  let user = urlParams.get("user");
  let devId = urlParams.get("devId");

  // Tạo một bảng
  const table = document.createElement('table');
  const hRef = ref(db, `${devId}/${user}/history`);

  clearButton.addEventListener("click", function() {
    set(hRef, "");
    const url = "/History.html?devId=" + encodeURIComponent(devId) + "&user=" + encodeURIComponent(user);
    window.location.href = url;
  });

  get(hRef).then((snapshot) => {
    if (snapshot.exists) {
      let val = Object.values(snapshot.val());

      if (val == "") {
        tableContainer.innerHTML = "Hiện lịch sử đo đang trống.";
        return;
      }

      const headerRow = document.createElement('tr');

      const headerCell1 = document.createElement('th');
      headerCell1.textContent = 'Date';
      headerRow.appendChild(headerCell1);

      const headerCell2 = document.createElement('th');
      headerCell2.textContent = 'Average BPM';
      headerCell2.marginLeft = '50px';
      headerCell2.paddingLeft = '50px';
      headerRow.appendChild(headerCell2);

      const headerCell3 = document.createElement('th');
      headerCell3.textContent = 'Average SpO2(%)';
      headerCell3.marginLeft = '50px';
      headerCell3.paddingLeft = '50px';
      headerRow.appendChild(headerCell3);

      table.appendChild(headerRow);

      for (let i = 0; i < val.length; i++) {
        const row = document.createElement('tr');

        for (let j = 0; j < 4; j++) {
          const cell = document.createElement('td');
          switch (j) {
            case 1: {
              cell.textContent = `${val[i].aveBPM}`;
              break;
            }
            case 2: {
              cell.textContent = `${val[i].aveOxy}`;
              break;
            }
            case 3: {
              let delHisButton = document.createElement("button");
              delHisButton.innerHTML = "Delete";

              delHisButton.addEventListener("click", function() {
                // console.log(val);
                val.splice(i, 1);
                // console.log(val);

                var updatedData = {};
                for (var j = 0; j < val.length; j++) {
                  updatedData[j] = val[j];
                }

                // console.log(updatedData);

                set(hRef, updatedData);

                const url = "/History.html?devId=" + encodeURIComponent(devId) + "&user=" + encodeURIComponent(user);
                window.location.href = url;
              })

              cell.appendChild(delHisButton);
              break;
            }
            default: cell.textContent = `${val[i].date}`;
          }

          row.appendChild(cell);
        }

        table.appendChild(row);
      }
    }
  })
    .catch((error) => console.log(error));

  tableContainer.innerHTML = '';

  tableContainer.appendChild(table);
}


const bpmEl = document.getElementById("bpm");
const oxyEl = document.getElementById("oxy");
const saveButtonEl = document.getElementById("saveButton");
const noMeasureEl = document.getElementById("noMeasure");

if (bpmEl && oxyEl && saveButtonEl && noMeasureEl) {
  let queryString = window.location.search;
  let urlParams = new URLSearchParams(queryString);
  let user = urlParams.get("user");
  let devId = urlParams.get("devId");

  const SpO2 = ref(db, `${devId}/SpO2`);
  const BPM = ref(db, `${devId}/beat`);

  var oldBPM = 0;
  var oldOxy = 0;
  var sumBPM = 0;
  var sumOxy = 0;
  var countBPM = -1;
  var countOxy = -1;
  var today = new Date();

  const ctx = document.getElementById('myChart');

  function drawChart(ctx){
    let chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'BPM',
            data: [],
            borderWidth: 1,
            backgroundColor: 'red',
            borderColor: 'red',
            tension: 0.5
          },
          {
            label: 'SpO2',
            data: [],
            borderWidth: 1,
            backgroundColor: 'blue',
            borderColor: 'blue',
            tension: 0.5
          }
        ]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });

    return chart;
  }

  const chart = drawChart(ctx);


  function updateChartData(data, id) {
    chart.data.labels.push(''); // Thêm một nhãn trống

    chart.data.datasets[id].data.push(data); // Thêm giá trị dữ liệu

    chart.update(); // Cập nhật biểu đồ
  }

  onValue(BPM, function(snapshot) {
    noMeasureEl.innerHTML = "";
    let beat = snapshot.val();
    oldBPM = beat;

    if(countBPM < 0) ++countBPM;
    else{
      updateChartData(beat, 0);
      updateChartData(oldOxy, 1)

      bpmEl.innerHTML = beat.toFixed(2);

      sumBPM += beat;
      countBPM += 1;
    }
    
  });

  onValue(SpO2, function(snapshot) {
    noMeasureEl.innerHTML = "";
    let oxy = snapshot.val();
    oldOxy = oxy;

    if(countOxy < 0) ++countOxy;
    else{
      updateChartData(oldBPM, 0)
      updateChartData(oxy, 1)

      oxyEl.innerHTML = oxy;

      sumOxy += oxy;
      countOxy += 1;
    }
    
  });

  saveButtonEl.addEventListener("click", function() {
    console.log(countOxy);
    console.log(countBPM);
    if (countBPM > 0 && countOxy > 0) {
      var date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear() + ' ' + today.getHours() + ':' + today.getMinutes();

      const hRef = ref(db, `${devId}/${user}/history`);

      let aveBPM = sumBPM / countBPM;
      let aveOxy = sumOxy / countOxy;

      push(hRef, {
        aveBPM: aveBPM.toFixed(2),
        aveOxy: aveOxy.toFixed(2),
        date: date
      });

      set(BPM, 0);
      set(SpO2, 0);

      chart.destroy();

      drawChart(ctx);

      sumBPM = 0;
      sumOxy = 0;
      countOxy = -1;
      countBPM = -1;
    }
    else {
      noMeasureEl.innerHTML = "You haven't taken any measurements yet!";
    }
  })
}
