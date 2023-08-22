let withdrawValue = {};
let totalAssets = 0;
let liveAccount = 0;
let USDT = 0;
let hideBalance = Boolean(localStorage.getItem('hideBalance')) || false;
let transHisData = [];
let firstWallet = 'USDT';
let comAmount = 0;
let currTab = 'trans';
const todayTime = new Date();
const d = `0${todayTime.getDate()}`.slice(-2);
const m = `0${todayTime.getMonth() + 1}`.slice(-2);
const y = todayTime.getFullYear().toString();
const yesterdayTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
const dy = `0${yesterdayTime.getDate()}`.slice(-2);
const my = `0${yesterdayTime.getMonth() + 1}`.slice(-2);
const yy = yesterdayTime.getFullYear().toString();

const genId = (length = 3) => Math.random().toString(36).slice(-length);

const formatNumber = (number) => {
  const strNumber = String(number);
  const parts = strNumber.split('.');
  const integerPart = parts[0];
  const decimalPart = parts.length > 1 ? '.' + parts[1] : '';
  let formattedInteger = '';
  for (let i = integerPart.length - 1, j = 0; i >= 0; i--, j++) {
    if (j > 0 && j % 3 === 0) {
      formattedInteger = ',' + formattedInteger;
    }
    formattedInteger = integerPart[i] + formattedInteger;
  }
  return formattedInteger + decimalPart;
};

const formatTimestamp = (timestamp, formatString) => {
  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = String(date.getFullYear());
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return formatString
    .replace('DD', day)
    .replace('MM', month)
    .replace('YYYY', year)
    .replace('YY', year.slice(-2))
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

const changeBalance = (el, value, prefix) => {
  if (!value.toString()) return;
  const setUserBalance = setInterval(() => {
    const target = document.querySelector(el);
    if (target) {
      target.innerHTML = `${prefix ? prefix : ''}${formatNumber(value)}`;
      clearInterval(setUserBalance);
    }
  }, 50);
};

const genTransHisTitle = () => `
  <li data-v-2e072a90="" class="itemHeader borderBtSecondary2">
    <div data-v-2e072a90="" class="block d-flex px-3">
      <div data-v-2e072a90="" class="block-col time colorSecondary2">
        <span data-v-2e072a90="" class="d-inline-block">Thời gian</span>
      </div>
      <div data-v-2e072a90="" class="block-col text-right amount colorSecondary2">
        <span data-v-2e072a90="" class="d-inline-block px-10-px">Giá trị</span>
      </div>
      <div data-v-2e072a90="" class="block-col type colorSecondary2">
        <span data-v-2e072a90="" class="d-inline-block px-10-px">Loại</span>
      </div>
      <div data-v-2e072a90="" class="block-col colorSecondary2" style="flex: 2 1 0%">
        <span data-v-2e072a90="" class="d-inline-block px-10-px">Txid/Mô tả</span>
      </div>
      <div data-v-2e072a90="" class="block-col note colorSecondary2">
        <span data-v-2e072a90="" class="d-inline-block px-10-px">Ghi chú</span>
      </div>
      <div data-v-2e072a90="" class="block-col status colorSecondary2 text-center">
        <span data-v-2e072a90="" class="d-inline-block px-10-px">Tình trạng</span>
      </div>
    </div>
  </li>
`;

const genTransHisHTML = (data) => `
  <li data-v-2e072a90="" class="link_txid borderBtSecondary2">
    <div data-v-2e072a90="" class="block d-flex px-3">
      <div data-v-2e072a90="" class="block-col time colorSecondary">
        <span data-v-2e072a90="" class="d-inline-block">${formatTimestamp(
          data.time,
          'DD/MM/YY HH:mm'
        )}</span>
      </div>
      <div data-v-2e072a90="" class="block-col text-right amount colorSecondary">
        <span data-v-2e072a90="" class="d-inline-block px-10-px ${
          data.type === 'deposit' ? 'colorSuccess' : 'colorDanger'
        }">${data.type === 'deposit' ? '+' : '-'}${formatNumber(data.amount)}</span>
      </div>
      <div data-v-2e072a90="" class="block-col type colorSecondary">
        <span data-v-2e072a90="" class="deitalType d-inline-block px-10-px">${
          data.type === 'deposit' ? 'Nạp tiền' : 'Rút tiền'
        } ${data.var === 'internal' ? '(Nội bộ)' : ''}</span>
      </div>
      <div
        data-v-2e072a90=""
        class="block-col colorSecondary text-left txid w-100"
        style="flex: 2 1 0%"
      >
        ${
          data.var === 'internal'
            ? `
              <span data-v-2e072a90="" class="deitalType d-inline-block px-10-px">
              ${data.type === 'deposit' ? 'Từ' : 'Đến'}: ${data.nickname}
              </span>
            `
            : `
        <a
          data-v-2e072a90=""
          href="https://bscscan.com/tx/${data.nickname}"
          target="_blank"
          class="deitalType d-inline-block px-10-px"
        >
          ${data.nickname}
        </a>
        `
        }
      </div>
      <div data-v-2e072a90="" class="block-col colorSecondary note w-100">
        ${
          data.note
            ? `<span data-v-2e072a90="" class="deitalType d-inline-block px-10-px">${data.note}</span>`
            : ''
        }
      </div>
      <div data-v-2e072a90="" class="block-col status text-center px-10-px">
        ${
          data.status === 'new'
            ? ''
            : `<span data-v-2e072a90="" class="d-inline-block mr-1"
        ><svg
          data-v-2e072a90=""
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 13.997 16.329"
          class="fillSuccess"
        >
          <g data-v-2e072a90="" id="event-confirm" transform="translate(-36.666 -72.999)">
            <g
              data-v-2e072a90=""
              id="Group_160"
              data-name="Group 160"
              transform="translate(32 66)"
            >
              <path
                data-v-2e072a90=""
                id="Path_74"
                data-name="Path 74"
                d="M38.664,50.328Z"
                transform="translate(-27 -27)"
                class="check"
              ></path>
              <path
                data-v-2e072a90=""
                id="Path_75"
                data-name="Path 75"
                d="M44.655,33.342a1.166,1.166,0,0,1,0,1.649L36.49,43.156a1.166,1.166,0,0,1-1.649,0l-3.5-3.5a1.166,1.166,0,1,1,1.649-1.649l2.674,2.675,7.34-7.34A1.166,1.166,0,0,1,44.655,33.342Z"
                transform="translate(-26.334 -26.002)"
                class="check"
              ></path>
            </g>
          </g></svg></span
      >`
        }
      </div>
    </div>
  </li>
`;

const genComTitle = () => `
  <li data-v-2e072a90="" class="itemHeader borderBtSecondary2">
    <div data-v-2e072a90="" class="block d-flex px-3">
      <div data-v-2e072a90="" class="block-col time colorSecondary2">
        <span data-v-2e072a90="" class="d-inline-block">Thời gian</span>
      </div>
      <div data-v-2e072a90="" class="block-col text-right amount colorSecondary2">
        <span data-v-2e072a90="" class="d-inline-block px-10-px">Giá trị</span>
      </div>
      <div data-v-2e072a90="" class="block-col type colorSecondary2">
        <span data-v-2e072a90="" class="d-inline-block px-10-px">Loại</span>
      </div>
      <div data-v-2e072a90="" class="block-col colorSecondary2" style="flex: 2 1 0%">
        <span data-v-2e072a90="" class="d-inline-block px-10-px">Txid/Mô tả</span>
      </div>
      <div data-v-2e072a90="" class="block-col status colorSecondary2 text-center">
        <span data-v-2e072a90="" class="d-inline-block px-10-px">Tình trạng</span>
      </div>
    </div>
  </li>
`;

const genComHTML = (amount) => {
  return `
    <li data-v-2e072a90="" class="link_txid">
      <div data-v-2e072a90="" class="block d-flex px-3">
        <div data-v-2e072a90="" class="block-col time colorSecondary">
          <span data-v-2e072a90="" class="d-inline-block">${formatTimestamp(
            Date.now(),
            'DD/MM/YY'
          )} 07:00</span>
        </div>
        <div data-v-2e072a90="" class="block-col text-right amount colorSecondary">
          <span data-v-2e072a90="" class="d-inline-block px-10-px colorSuccess">+${formatNumber(
            amount
          )}</span>
        </div>
        <div data-v-2e072a90="" class="block-col type colorSecondary">
          <span data-v-2e072a90="" class="deitalType d-inline-block px-10-px"
            >Hoa hồng Giao dịch</span
          >
        </div>
        <div
          data-v-2e072a90=""
          class="block-col colorSecondary text-left txid w-100"
          style="flex: 2 1 0%"
        >
          <span data-v-2e072a90="" class="item-txid-desc">Hoa hồng Giao dịch</span>
        </div>
        <!---->
        <div data-v-2e072a90="" class="block-col status text-center px-10-px">
          <span data-v-2e072a90="" class="d-inline-block mr-1"
            ><svg
              data-v-2e072a90=""
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 13.997 16.329"
              class="fillSuccess"
            >
              <g data-v-2e072a90="" id="event-confirm" transform="translate(-36.666 -72.999)">
                <g
                  data-v-2e072a90=""
                  id="Group_160"
                  data-name="Group 160"
                  transform="translate(32 66)"
                >
                  <path
                    data-v-2e072a90=""
                    id="Path_74"
                    data-name="Path 74"
                    d="M38.664,50.328Z"
                    transform="translate(-27 -27)"
                    class="check"
                  ></path>
                  <path
                    data-v-2e072a90=""
                    id="Path_75"
                    data-name="Path 75"
                    d="M44.655,33.342a1.166,1.166,0,0,1,0,1.649L36.49,43.156a1.166,1.166,0,0,1-1.649,0l-3.5-3.5a1.166,1.166,0,1,1,1.649-1.649l2.674,2.675,7.34-7.34A1.166,1.166,0,0,1,44.655,33.342Z"
                    transform="translate(-26.334 -26.002)"
                    class="check"
                  ></path>
                </g>
              </g></svg></span
        </div>
      </div>
    </li>
  `;
};

const fakeNotiCountInterval = setInterval(() => {
  const notiCount = document.querySelector('span.notification-dropdown-button-number');
  if (notiCount) {
    notiCount.innerHTML = transHisData.length + 2;
    clearInterval(fakeNotiCountInterval);
  } else {
    const notiParent = document.querySelector('div.notification-dropdown-button');
    if (notiParent) {
      notiParent.innerHTML += `
        <span class="notification-dropdown-button-number">${transHisData.length + 2}</span>
      `;
      clearInterval(fakeNotiCountInterval);
    }
  }
}, 200);

chrome.runtime.sendMessage({ action: 'getLocalStorage', key: 'total_assets' }, (res) => {
  if (res.value.toString()) {
    totalAssets = res.value;
    changeBalance('span.user-balance', totalAssets);
  }
});

const changeAssets = (value) => {
  totalAssets = value;
  USDT = totalAssets - liveAccount;
  changeBalance('span.user-balance', totalAssets);
  changeBalance('span.coin-value-1', USDT);
  changeBalance('span.coin-value-2', USDT, '~$');
};

chrome.runtime.sendMessage({ action: 'getLocalStorage', key: 'com_his' }, (res) => {
  comAmount = res.value;
});

// setTimeout(() => {
//   const hideBtnWrap = document.querySelector(
//     'div.d-block.justify-content-between.mb-2.position-relative'
//   );

//   hideBtnWrap.removeChild(
//     document.querySelector('a.btnEyes.d-flex.align-items-center.colorSecondary.position-absolute')
//   );

//   const link = document.createElement('a');
//   link.setAttribute('data-v-5866bac8', '');
//   link.setAttribute('href', 'javascript: void(0);');
//   link.setAttribute('class', 'btnEyes d-flex align-items-center colorSecondary position-absolute');
//   var span1 = document.createElement('span');
//   span1.setAttribute('data-v-5866bac8', '');
//   span1.setAttribute('class', `btn-eyes ${hideBalance ? '' : 'hide'}`);
//   var span2 = document.createElement('span');
//   span2.setAttribute('data-v-5866bac8', '');
//   span2.textContent = `${hideBalance ? 'Show' : 'Hide'} balance`;
//   link.appendChild(span1);
//   link.appendChild(span2);
//   link.onclick = onclick = () => toggleShowBalance(hideBalance, assets);
//   hideBtnWrap.appendChild(link);
// }, 1000);

// const toggleShowBalance = (isHide, value) => {
//   hideBalance = !isHide;
//   console.log({ isHide, value });
//   if (isHide) {
//     changeBalance('span.user-balance', '******');
//     changeBalance('span.coin-value-1', '******');
//     changeBalance('span.coin-value-2', '******');
//   } else {
//     changeBalance('span.user-balance', value);
//     changeBalance('span.coin-value-1', value);
//     changeBalance('span.coin-value-2', value);
//   }
// };

chrome.runtime.sendMessage({ action: 'getLocalStorage', key: 'trans_his' }, (res) => {
  transHisData = res.value ? res.value : [];
  renderHisTable(transHisData);
});

const renderHisTable = (data) => {
  const hisTable = setInterval(() => {
    const hisNav = document.querySelector('div.history-nav');
    if (hisNav) {
      hisNav.innerHTML = `
        <ul data-v-2e072a90="" class="nav nav-tabs"><li data-v-2e072a90="" class="item ${
          currTab === 'trans' ? 'active' : ''
        }"><a data-v-2e072a90="" href="#usdt">
            USDT
        </a></li><li data-v-2e072a90="" class="item ${
          currTab === 'com' ? 'active' : ''
        }"><a data-v-2e072a90="" href="#win_coms"><span data-v-2e072a90="" class="win_coms"></span>
            Hoa hồng
        </a></li></ul>
      `;

      const boxRes = document.querySelector('div.boxResult.bgSecondary4.mb-3');
      if (boxRes) {
        boxRes.innerHTML = `
          <div class="loading">
            <div class="loading__ring">
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" style="enable-background:new 0 0 100 100;" xml:space="preserve"><path d="M85.5,42c-0.2-0.8-0.5-1.7-0.8-2.5c-0.3-0.9-0.7-1.6-1-2.3c-0.3-0.7-0.6-1.3-1-1.9c0.3,0.5,0.5,1.1,0.8,1.7  c0.2,0.7,0.6,1.5,0.8,2.3s0.5,1.7,0.8,2.5c0.8,3.5,1.3,7.5,0.8,12c-0.4,4.3-1.8,9-4.2,13.4c-2.4,4.2-5.9,8.2-10.5,11.2  c-1.1,0.7-2.2,1.5-3.4,2c-0.5,0.2-1.2,0.6-1.8,0.8s-1.3,0.5-1.9,0.8c-2.6,1-5.3,1.7-8.1,1.8l-1.1,0.1L53.8,84c-0.7,0-1.4,0-2.1,0  c-1.4-0.1-2.9-0.1-4.2-0.5c-1.4-0.1-2.8-0.6-4.1-0.8c-1.4-0.5-2.7-0.9-3.9-1.5c-1.2-0.6-2.4-1.2-3.7-1.9c-0.6-0.3-1.2-0.7-1.7-1.1  l-0.8-0.6c-0.3-0.1-0.6-0.4-0.8-0.6l-0.8-0.6L31.3,76l-0.2-0.2L31,75.7l-0.1-0.1l0,0l-1.5-1.5c-1.2-1-1.9-2.1-2.7-3.1  c-0.4-0.4-0.7-1.1-1.1-1.7l-1.1-1.7c-0.3-0.6-0.6-1.2-0.9-1.8c-0.2-0.5-0.6-1.2-0.8-1.8c-0.4-1.2-1-2.4-1.2-3.7  c-0.2-0.6-0.4-1.2-0.5-1.9c-0.1-0.6-0.2-1.2-0.3-1.8c-0.3-1.2-0.3-2.4-0.4-3.7c-0.1-1.2,0-2.5,0.1-3.7c0.2-1.2,0.3-2.4,0.6-3.5  c0.1-0.6,0.3-1.1,0.4-1.7l0.1-0.8l0.3-0.8c1.5-4.3,3.8-8,6.5-11c0.8-0.8,1.4-1.5,2.1-2.1c0.9-0.9,1.4-1.3,2.2-1.8  c1.4-1.2,2.9-2,4.3-2.8c2.8-1.5,5.5-2.3,7.7-2.8s4-0.7,5.2-0.6c0.6-0.1,1.1,0,1.4,0s0.4,0,0.4,0h0.1c2.7,0.1,5-2.2,5-5  c0.1-2.7-2.2-5-5-5c-0.2,0-0.2,0-0.3,0c0,0-0.2,0.1-0.6,0.1c-0.4,0-1,0-1.8,0.1c-1.6,0.1-4,0.4-6.9,1.2c-2.9,0.8-6.4,2-9.9,4.1  c-1.8,1-3.6,2.3-5.4,3.8C26,21.4,25,22.2,24.4,23c-0.2,0.2-0.4,0.4-0.6,0.6c-0.2,0.2-0.5,0.4-0.6,0.7c-0.5,0.4-0.8,0.9-1.3,1.4  c-3.2,3.9-5.9,8.8-7.5,14.3l-0.3,1l-0.2,1.1c-0.1,0.7-0.3,1.4-0.4,2.1c-0.3,1.5-0.4,2.9-0.5,4.5c0,1.5-0.1,3,0.1,4.5  c0.2,1.5,0.2,3,0.6,4.6c0.1,0.7,0.3,1.5,0.4,2.3c0.2,0.8,0.5,1.5,0.7,2.3c0.4,1.6,1.1,3,1.7,4.4c0.3,0.7,0.7,1.4,1.1,2.1  c0.4,0.8,0.8,1.4,1.2,2.1c0.5,0.7,0.9,1.4,1.4,2s0.9,1.3,1.5,1.9c1.1,1.3,2.2,2.7,3.3,3.5l1.7,1.6c0,0,0.1,0.1,0.1,0.1c0,0,0,0,0,0  c0,0,0,0,0,0l0.1,0.1l0.1,0.1h0.2l0.5,0.4l1,0.7c0.4,0.2,0.6,0.5,1,0.7l1.1,0.6c0.8,0.4,1.4,0.9,2.1,1.2c1.4,0.7,2.9,1.5,4.4,2  c1.5,0.7,3.1,1,4.6,1.5c1.5,0.3,3.1,0.7,4.7,0.8c1.6,0.2,3.1,0.2,4.7,0.2c0.8,0,1.6-0.1,2.4-0.1l1.2-0.1l1.1-0.1  c3.1-0.4,6.1-1.3,8.9-2.4c0.8-0.3,1.4-0.6,2.1-0.9s1.3-0.7,2-1.1c1.3-0.7,2.6-1.7,3.7-2.5c0.5-0.4,1-0.9,1.6-1.3l0.8-0.6l0.2-0.2  c0,0,0.1-0.1,0.1-0.1c0.1-0.1,0,0,0,0v0.1l0.1-0.1l0.4-0.4c0.5-0.5,1-1,1.5-1.5c0.3-0.3,0.5-0.5,0.8-0.8l0.7-0.8  c0.9-1.1,1.8-2.2,2.5-3.3c0.4-0.6,0.7-1.1,1.1-1.7c0.3-0.7,0.6-1.2,0.9-1.8c2.4-4.9,3.5-9.8,3.7-14.4C87.3,49.7,86.6,45.5,85.5,42z"></path></svg>
            </div>
            <div class="loading__ring">
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" style="enable-background:new 0 0 100 100;" xml:space="preserve"><path d="M85.5,42c-0.2-0.8-0.5-1.7-0.8-2.5c-0.3-0.9-0.7-1.6-1-2.3c-0.3-0.7-0.6-1.3-1-1.9c0.3,0.5,0.5,1.1,0.8,1.7  c0.2,0.7,0.6,1.5,0.8,2.3s0.5,1.7,0.8,2.5c0.8,3.5,1.3,7.5,0.8,12c-0.4,4.3-1.8,9-4.2,13.4c-2.4,4.2-5.9,8.2-10.5,11.2  c-1.1,0.7-2.2,1.5-3.4,2c-0.5,0.2-1.2,0.6-1.8,0.8s-1.3,0.5-1.9,0.8c-2.6,1-5.3,1.7-8.1,1.8l-1.1,0.1L53.8,84c-0.7,0-1.4,0-2.1,0  c-1.4-0.1-2.9-0.1-4.2-0.5c-1.4-0.1-2.8-0.6-4.1-0.8c-1.4-0.5-2.7-0.9-3.9-1.5c-1.2-0.6-2.4-1.2-3.7-1.9c-0.6-0.3-1.2-0.7-1.7-1.1  l-0.8-0.6c-0.3-0.1-0.6-0.4-0.8-0.6l-0.8-0.6L31.3,76l-0.2-0.2L31,75.7l-0.1-0.1l0,0l-1.5-1.5c-1.2-1-1.9-2.1-2.7-3.1  c-0.4-0.4-0.7-1.1-1.1-1.7l-1.1-1.7c-0.3-0.6-0.6-1.2-0.9-1.8c-0.2-0.5-0.6-1.2-0.8-1.8c-0.4-1.2-1-2.4-1.2-3.7  c-0.2-0.6-0.4-1.2-0.5-1.9c-0.1-0.6-0.2-1.2-0.3-1.8c-0.3-1.2-0.3-2.4-0.4-3.7c-0.1-1.2,0-2.5,0.1-3.7c0.2-1.2,0.3-2.4,0.6-3.5  c0.1-0.6,0.3-1.1,0.4-1.7l0.1-0.8l0.3-0.8c1.5-4.3,3.8-8,6.5-11c0.8-0.8,1.4-1.5,2.1-2.1c0.9-0.9,1.4-1.3,2.2-1.8  c1.4-1.2,2.9-2,4.3-2.8c2.8-1.5,5.5-2.3,7.7-2.8s4-0.7,5.2-0.6c0.6-0.1,1.1,0,1.4,0s0.4,0,0.4,0h0.1c2.7,0.1,5-2.2,5-5  c0.1-2.7-2.2-5-5-5c-0.2,0-0.2,0-0.3,0c0,0-0.2,0.1-0.6,0.1c-0.4,0-1,0-1.8,0.1c-1.6,0.1-4,0.4-6.9,1.2c-2.9,0.8-6.4,2-9.9,4.1  c-1.8,1-3.6,2.3-5.4,3.8C26,21.4,25,22.2,24.4,23c-0.2,0.2-0.4,0.4-0.6,0.6c-0.2,0.2-0.5,0.4-0.6,0.7c-0.5,0.4-0.8,0.9-1.3,1.4  c-3.2,3.9-5.9,8.8-7.5,14.3l-0.3,1l-0.2,1.1c-0.1,0.7-0.3,1.4-0.4,2.1c-0.3,1.5-0.4,2.9-0.5,4.5c0,1.5-0.1,3,0.1,4.5  c0.2,1.5,0.2,3,0.6,4.6c0.1,0.7,0.3,1.5,0.4,2.3c0.2,0.8,0.5,1.5,0.7,2.3c0.4,1.6,1.1,3,1.7,4.4c0.3,0.7,0.7,1.4,1.1,2.1  c0.4,0.8,0.8,1.4,1.2,2.1c0.5,0.7,0.9,1.4,1.4,2s0.9,1.3,1.5,1.9c1.1,1.3,2.2,2.7,3.3,3.5l1.7,1.6c0,0,0.1,0.1,0.1,0.1c0,0,0,0,0,0  c0,0,0,0,0,0l0.1,0.1l0.1,0.1h0.2l0.5,0.4l1,0.7c0.4,0.2,0.6,0.5,1,0.7l1.1,0.6c0.8,0.4,1.4,0.9,2.1,1.2c1.4,0.7,2.9,1.5,4.4,2  c1.5,0.7,3.1,1,4.6,1.5c1.5,0.3,3.1,0.7,4.7,0.8c1.6,0.2,3.1,0.2,4.7,0.2c0.8,0,1.6-0.1,2.4-0.1l1.2-0.1l1.1-0.1  c3.1-0.4,6.1-1.3,8.9-2.4c0.8-0.3,1.4-0.6,2.1-0.9s1.3-0.7,2-1.1c1.3-0.7,2.6-1.7,3.7-2.5c0.5-0.4,1-0.9,1.6-1.3l0.8-0.6l0.2-0.2  c0,0,0.1-0.1,0.1-0.1c0.1-0.1,0,0,0,0v0.1l0.1-0.1l0.4-0.4c0.5-0.5,1-1,1.5-1.5c0.3-0.3,0.5-0.5,0.8-0.8l0.7-0.8  c0.9-1.1,1.8-2.2,2.5-3.3c0.4-0.6,0.7-1.1,1.1-1.7c0.3-0.7,0.6-1.2,0.9-1.8c2.4-4.9,3.5-9.8,3.7-14.4C87.3,49.7,86.6,45.5,85.5,42z"></path></svg>
            </div>
          </div>
        `;
        // boxRes.classList.add('ld-loading');

        const html =
          currTab === 'trans'
            ? data && data?.length > 0
              ? data.map((item) => genTransHisHTML(item)).join('')
              : ''
            : data
            ? genComHTML(data)
            : '';
        boxRes.innerHTML += `
            ${
              currTab === 'trans'
                ? `<ul
                      data-v-2e072a90=""
                      class="list-unstyled borderTopUnset m-0 borderSecondary2 bgSecondary4 boxResult-content overflow-hidden"
                      style="border-radius: 0px 0px 4px 4px"
                    >
                    ${
                      data && data?.length > 0
                        ? `
                            <li data-v-2e072a90="" class="itemHeader borderBtSecondary2">
                              <div data-v-2e072a90="" class="block d-flex px-3">
                                <div data-v-2e072a90="" class="block-col time colorSecondary2">
                                  <span data-v-2e072a90="" class="d-inline-block">Thời gian</span>
                                </div>
                                <div data-v-2e072a90="" class="block-col text-right amount colorSecondary2">
                                  <span data-v-2e072a90="" class="d-inline-block px-10-px">Giá trị</span>
                                </div>
                                <div data-v-2e072a90="" class="block-col type colorSecondary2">
                                  <span data-v-2e072a90="" class="d-inline-block px-10-px">Loại</span>
                                </div>
                                <div data-v-2e072a90="" class="block-col colorSecondary2" style="flex: 2 1 0%">
                                  <span data-v-2e072a90="" class="d-inline-block px-10-px">Txid/Mô tả</span>
                                </div>
                                <div data-v-2e072a90="" class="block-col note colorSecondary2">
                                  <span data-v-2e072a90="" class="d-inline-block px-10-px">Ghi chú</span>
                                </div>
                                <div data-v-2e072a90="" class="block-col status colorSecondary2 text-center">
                                  <span data-v-2e072a90="" class="d-inline-block px-10-px">Tình trạng</span>
                                </div>
                              </div>
                            </li>
                            `
                        : `<li data-v-2e072a90="" class="item borderSecondary2 p-3 borderTopUnset">
                        <div data-v-2e072a90="" class="block d-flex px-3">
                          <div data-v-2e072a90="" class="block-col colorSecondary w-100 text-center">
                            <span data-v-2e072a90="">Không có dữ liệu</span>
                          </div>
                        </div>
                      </li>`
                    }`
                : `<ul
                    data-v-2e072a90=""
                    class="list-unstyled borderTopUnset m-0 borderSecondary2 bgSecondary4 boxResult-content overflow-hidden"
                    style="border-radius: 0px 0px 4px 4px"
                  >
                    ${
                      data
                        ? `
                            <li data-v-2e072a90="" class="itemHeader borderBtSecondary2">
                              <div data-v-2e072a90="" class="block d-flex px-3">
                                <div data-v-2e072a90="" class="block-col time colorSecondary2">
                                  <span data-v-2e072a90="" class="d-inline-block">Thời gian</span>
                                </div>
                                <div data-v-2e072a90="" class="block-col text-right amount colorSecondary2">
                                  <span data-v-2e072a90="" class="d-inline-block px-10-px">Giá trị</span>
                                </div>
                                <div data-v-2e072a90="" class="block-col type colorSecondary2">
                                  <span data-v-2e072a90="" class="d-inline-block px-10-px">Loại</span>
                                </div>
                                <div data-v-2e072a90="" class="block-col colorSecondary2" style="flex: 2 1 0%">
                                  <span data-v-2e072a90="" class="d-inline-block px-10-px">Txid/Mô tả</span>
                                </div>
                                <!---->
                                <div data-v-2e072a90="" class="block-col status colorSecondary2 text-center">
                                  <span data-v-2e072a90="" class="d-inline-block px-10-px">Tình trạng</span>
                                </div>
                              </div>
                            </li>
                          `
                        : `<li data-v-2e072a90="" class="item borderSecondary2 p-3 borderTopUnset">
                            <div data-v-2e072a90="" class="block d-flex px-3">
                              <div data-v-2e072a90="" class="block-col colorSecondary w-100 text-center">
                                <span data-v-2e072a90="">Không có dữ liệu</span>
                              </div>
                            </div>
                          </li>`
                    }`
            }
              ${html}
            </ul>
          `;

        const navTabs = document.querySelectorAll('ul[data-v-2e072a90] li.item');
        navTabs[0].onclick = (e) => {
          e.preventDefault();
          currTab = 'trans';
          if (!navTabs[0].classList.contains('active')) {
            navTabs[0].classList.add('active');
            navTabs[1].classList.remove('active');
            renderHisTable(transHisData);
          }
        };
        navTabs[1].onclick = (e) => {
          e.preventDefault();
          currTab = 'com';
          if (!navTabs[1].classList.contains('active')) {
            navTabs[1].classList.add('active');
            navTabs[0].classList.remove('active');
            renderHisTable(comAmount);
          }
        };
        changeAssets(totalAssets);

        clearInterval(hisTable);

        // setTimeout(() => {
        //   boxRes.classList.remove('ld-loading');
        // }, 500);
      }
    }
  }, 200);
};

const renderNotiList = (transHis, comAmount) => {
  const sectionNotiList = document.querySelector(
    'section.ps-container.scroll-area.notification-wrap-list.ps.ps--active-y'
  );
  if (!sectionNotiList) return;
  const comTime = new Date();
  comTime.setHours(7, 5, 57, 0);
  const yesterday =
    Date.now() < comTime.getTime()
      ? new Date(yesterdayTime.getTime() - 24 * 60 * 60 * 1000)
      : yesterdayTime;
  const today = Date.now() < comTime.getTime() ? yesterdayTime : new Date();
  const transHtmlAffer = transHis
    .filter((item) => item.time > comTime.getTime())
    .map((item) => {
      if (item.type === 'deposit')
        return item.var === 'internal'
          ? `
            <li class="notification-item">
              <div>
                <h4 class="notification-item-title">Nạp tiền nội bộ thành công</h4>
                <p class="notification-item-text">
                  - Số lượng: <b class="textnote-notidesc">${formatNumber(
                    item.amount
                  )} USDT</b><br />
                  - Memo: <b class="textnote-notidesc">${item.note}</b><br />
                  - Người gửi: <b class="textnote-notidesc">${item.nickname}</b>
                </p>
                <span class="notification-item-time">${formatTimestamp(
                  item.time,
                  'YYYY-MM-DD HH:mm:ss'
                )} (UTC)</span>
                <span class="notification-item-icon">
                  <svg
                    id="Group_21411"
                    data-name="Group 21411"
                    xmlns="http://www.w3.org/2000/svg"
                    width="32.367"
                    height="28.505"
                    viewBox="0 0 32.367 28.505"
                  >
                    <path
                      id="Combined-Shape"
                      d="M13.831,8.69c.063-.063.137-.106.2-.167a10.488,10.488,0,0,0-3.476-.633,10.558,10.558,0,1,0,9.183,15.67l-5.923-5.925A6.32,6.32,0,0,1,13.831,8.69Zm17.917,2.986a2.1,2.1,0,0,0-2.973-.015l-2.382,2.382V2.605a2.112,2.112,0,0,0-4.223,0V14.043l-2.38-2.382A2.113,2.113,0,0,0,16.8,14.649l6,6a2.071,2.071,0,0,0,1.47.6,2.045,2.045,0,0,0,1.489-.6l6-6A2.113,2.113,0,0,0,31.748,11.676Z"
                      transform="translate(0 -0.5)"
                      fill="#2077FC"
                      fill-rule="evenodd"
                    ></path>
                    <path
                      id="Combined-Shape-2"
                      data-name="Combined-Shape"
                      d="M13.831,5.616c.063-.063.137-.106.2-.167a10.488,10.488,0,0,0-3.476-.633,10.558,10.558,0,1,0,9.183,15.67L13.818,14.56A6.32,6.32,0,0,1,13.831,5.616Z"
                      transform="translate(0 2.575)"
                      fill="#FEFEFE"
                      fill-rule="evenodd"
                    ></path>
                  </svg>
                </span>
                <span class="notification-item-status"></span>
                <input type="hidden" name="url" value="/user/balance?currency=USDT" />
                <input type="hidden" name="type" value="INTERNAL_DEPOSIT_SUCCESS" />
              </div>
              <span class="notification-item-time">${formatTimestamp(
                item.time,
                'MM/DD/YY HH:mm:ss'
              )}</span>
            </li>
          `
          : `
            <li class="notification-item">
              <div>
                <h4 class="notification-item-title">Nạp tiền thành công</h4>
                <p class="notification-item-text">
                  Bạn đã nạp <b class="textnote-notidesc">${formatNumber(item.amount)} USDT</b>.
                </p>
                <span class="notification-item-time">2023-07-17 14:57:58 (UTC)</span>
                <span class="notification-item-icon">
                  <svg
                    id="Group_21411"
                    data-name="Group 21411"
                    xmlns="http://www.w3.org/2000/svg"
                    width="32.367"
                    height="28.505"
                    viewBox="0 0 32.367 28.505"
                  >
                    <path
                      id="Combined-Shape"
                      d="M13.831,8.69c.063-.063.137-.106.2-.167a10.488,10.488,0,0,0-3.476-.633,10.558,10.558,0,1,0,9.183,15.67l-5.923-5.925A6.32,6.32,0,0,1,13.831,8.69Zm17.917,2.986a2.1,2.1,0,0,0-2.973-.015l-2.382,2.382V2.605a2.112,2.112,0,0,0-4.223,0V14.043l-2.38-2.382A2.113,2.113,0,0,0,16.8,14.649l6,6a2.071,2.071,0,0,0,1.47.6,2.045,2.045,0,0,0,1.489-.6l6-6A2.113,2.113,0,0,0,31.748,11.676Z"
                      transform="translate(0 -0.5)"
                      fill="#2077fc"
                      fill-rule="evenodd"
                    ></path>
                    <path
                      id="Combined-Shape-2"
                      data-name="Combined-Shape"
                      d="M13.831,5.616c.063-.063.137-.106.2-.167a10.488,10.488,0,0,0-3.476-.633,10.558,10.558,0,1,0,9.183,15.67L13.818,14.56A6.32,6.32,0,0,1,13.831,5.616Z"
                      transform="translate(0 2.575)"
                      fill="#fefefe"
                      fill-rule="evenodd"
                    ></path>
                  </svg>
                </span>
                <span class="notification-item-status"></span>
                <input type="hidden" name="url" value="/user/balance?currency=USDT" />
                <input type="hidden" name="type" value="DEPOSIT_SUCCESS" />
              </div>
              <span class="notification-item-time">${formatTimestamp(
                item.time,
                'MM/DD/YY HH:mm:ss'
              )}</span>
            </li>
          `;
      else
        return item.var === 'internal'
          ? `
            <li class="notification-item">
              <div>
                <h4 class="notification-item-title">Rút tiền nội bộ thành công</h4>
                <p class="notification-item-text">
                  - Số lượng: <b class="textnote-notidesc">${formatNumber(
                    item.amount
                  )} USDT</b><br />
                  - Memo: <b class="textnote-notidesc">${item.note}</b><br />
                  - Người nhận: <b class="textnote-notidesc">${item.nickname}</b>
                </p>
                <span class="notification-item-time">${formatTimestamp(
                  item.time,
                  'YYYY-MM-DD HH:mm:ss'
                )} (UTC)</span>
                <span class="notification-item-icon">
                  <svg
                    id="Group_21412"
                    data-name="Group 21412"
                    xmlns="http://www.w3.org/2000/svg"
                    width="30.338"
                    height="28.644"
                    viewBox="0 0 30.338 28.644"
                  >
                    <g id="icon-withdraw-red" transform="translate(0 0)">
                      <g id="icon-withdraw">
                        <path
                          id="Combined-Shape"
                          d="M16.362,18.069V13.942a6.052,6.052,0,0,1-5.749-5.721c-.131,0-.252-.037-.383-.037a10.23,10.23,0,1,0,8.976,15.04A6.122,6.122,0,0,1,16.362,18.069ZM24.546,6.985l2.308,2.308A2.046,2.046,0,0,0,29.746,6.4L23.934.585a2.05,2.05,0,0,0-2.868,0L15.253,6.4a2.046,2.046,0,0,0,2.893,2.893l2.308-2.308V18.068a2.046,2.046,0,0,0,4.092,0Z"
                          transform="translate(0 0)"
                          fill="#2077FC"
                          fill-rule="evenodd"
                        ></path>
                      </g>
                    </g>
                    <g
                      id="icon-withdraw-red-2"
                      data-name="icon-withdraw-red"
                      transform="translate(0 8.184)"
                    >
                      <g id="icon-withdraw-2" data-name="icon-withdraw">
                        <path
                          id="Combined-Shape-2"
                          data-name="Combined-Shape"
                          d="M16.362,15.024V10.9a6.052,6.052,0,0,1-5.749-5.721c-.131,0-.252-.037-.383-.037a10.23,10.23,0,1,0,8.976,15.04A6.122,6.122,0,0,1,16.362,15.024Z"
                          transform="translate(0 -5.14)"
                          fill="#FEFEFE"
                          fill-rule="evenodd"
                        ></path>
                      </g>
                    </g>
                  </svg>
                </span>
                <span class="notification-item-status"></span>
                <input type="hidden" name="url" value="/user/balance?currency=USDT" />
              </div>
              <span class="notification-item-time">${formatTimestamp(
                item.time,
                'MM/DD/YY HH:mm:ss'
              )}</span>
            </li>
          `
          : `
            <li class="notification-item">
              <div>
                <h4 class="notification-item-title">Rút tiền thành công</h4>
                <p class="notification-item-text">
                  Bạn đã rút thành công <b class="textnote-notidesc">${formatNumber(
                    item.amount
                  )} USDT</b>.
                </p>
                <span class="notification-item-time">2023-07-17 10:53:22 (UTC)</span>
                <span class="notification-item-icon">
                  <svg
                    id="Group_21412"
                    data-name="Group 21412"
                    xmlns="http://www.w3.org/2000/svg"
                    width="30.338"
                    height="28.644"
                    viewBox="0 0 30.338 28.644"
                  >
                    <g id="icon-withdraw-red" transform="translate(0 0)">
                      <g id="icon-withdraw">
                        <path
                          id="Combined-Shape"
                          d="M16.362,18.069V13.942a6.052,6.052,0,0,1-5.749-5.721c-.131,0-.252-.037-.383-.037a10.23,10.23,0,1,0,8.976,15.04A6.122,6.122,0,0,1,16.362,18.069ZM24.546,6.985l2.308,2.308A2.046,2.046,0,0,0,29.746,6.4L23.934.585a2.05,2.05,0,0,0-2.868,0L15.253,6.4a2.046,2.046,0,0,0,2.893,2.893l2.308-2.308V18.068a2.046,2.046,0,0,0,4.092,0Z"
                          transform="translate(0 0)"
                          fill="#2077fc"
                          fill-rule="evenodd"
                        ></path>
                      </g>
                    </g>
                    <g
                      id="icon-withdraw-red-2"
                      data-name="icon-withdraw-red"
                      transform="translate(0 8.184)"
                    >
                      <g id="icon-withdraw-2" data-name="icon-withdraw">
                        <path
                          id="Combined-Shape-2"
                          data-name="Combined-Shape"
                          d="M16.362,15.024V10.9a6.052,6.052,0,0,1-5.749-5.721c-.131,0-.252-.037-.383-.037a10.23,10.23,0,1,0,8.976,15.04A6.122,6.122,0,0,1,16.362,15.024Z"
                          transform="translate(0 -5.14)"
                          fill="#fefefe"
                          fill-rule="evenodd"
                        ></path>
                      </g>
                    </g>
                  </svg>
                </span>
                <span class="notification-item-status"></span>
                <input type="hidden" name="url" value="/user/balance?currency=USDT" />
              </div>
              <span class="notification-item-time">${formatTimestamp(
                item.time,
                'MM/DD/YY HH:mm:ss'
              )}</span>
            </li>
            `;
    })
    .join('');
  const transHtmlBefore = transHis
    .filter((item) => item.time < comTime.getTime())
    .map((item) => {
      if (item.type === 'deposit')
        return item.var === 'internal'
          ? `
              <li class="notification-item">
                <div>
                  <h4 class="notification-item-title">Nạp tiền nội bộ thành công</h4>
                  <p class="notification-item-text">
                    - Số lượng: <b class="textnote-notidesc">${formatNumber(
                      item.amount
                    )} USDT</b><br />
                    - Memo: <b class="textnote-notidesc">${item.note}</b><br />
                    - Người gửi: <b class="textnote-notidesc">${item.nickname}</b>
                  </p>
                  <span class="notification-item-time">${formatTimestamp(
                    item.time,
                    'YYYY-MM-DD HH:mm:ss'
                  )} (UTC)</span>
                  <span class="notification-item-icon">
                    <svg
                      id="Group_21411"
                      data-name="Group 21411"
                      xmlns="http://www.w3.org/2000/svg"
                      width="32.367"
                      height="28.505"
                      viewBox="0 0 32.367 28.505"
                    >
                      <path
                        id="Combined-Shape"
                        d="M13.831,8.69c.063-.063.137-.106.2-.167a10.488,10.488,0,0,0-3.476-.633,10.558,10.558,0,1,0,9.183,15.67l-5.923-5.925A6.32,6.32,0,0,1,13.831,8.69Zm17.917,2.986a2.1,2.1,0,0,0-2.973-.015l-2.382,2.382V2.605a2.112,2.112,0,0,0-4.223,0V14.043l-2.38-2.382A2.113,2.113,0,0,0,16.8,14.649l6,6a2.071,2.071,0,0,0,1.47.6,2.045,2.045,0,0,0,1.489-.6l6-6A2.113,2.113,0,0,0,31.748,11.676Z"
                        transform="translate(0 -0.5)"
                        fill="#2077FC"
                        fill-rule="evenodd"
                      ></path>
                      <path
                        id="Combined-Shape-2"
                        data-name="Combined-Shape"
                        d="M13.831,5.616c.063-.063.137-.106.2-.167a10.488,10.488,0,0,0-3.476-.633,10.558,10.558,0,1,0,9.183,15.67L13.818,14.56A6.32,6.32,0,0,1,13.831,5.616Z"
                        transform="translate(0 2.575)"
                        fill="#FEFEFE"
                        fill-rule="evenodd"
                      ></path>
                    </svg>
                  </span>
                  <span class="notification-item-status"></span>
                  <input type="hidden" name="url" value="/user/balance?currency=USDT" />
                  <input type="hidden" name="type" value="INTERNAL_DEPOSIT_SUCCESS" />
                </div>
                <span class="notification-item-time">${formatTimestamp(
                  item.time,
                  'MM/DD/YY HH:mm:ss'
                )}</span>
              </li>
            `
          : `
            <li class="notification-item">
              <div>
                <h4 class="notification-item-title">Nạp tiền thành công</h4>
                <p class="notification-item-text">
                  Bạn đã nạp <b class="textnote-notidesc">${formatNumber(item.amount)} USDT</b>.
                </p>
                <span class="notification-item-time">2023-07-17 14:57:58 (UTC)</span>
                <span class="notification-item-icon">
                  <svg
                    id="Group_21411"
                    data-name="Group 21411"
                    xmlns="http://www.w3.org/2000/svg"
                    width="32.367"
                    height="28.505"
                    viewBox="0 0 32.367 28.505"
                  >
                    <path
                      id="Combined-Shape"
                      d="M13.831,8.69c.063-.063.137-.106.2-.167a10.488,10.488,0,0,0-3.476-.633,10.558,10.558,0,1,0,9.183,15.67l-5.923-5.925A6.32,6.32,0,0,1,13.831,8.69Zm17.917,2.986a2.1,2.1,0,0,0-2.973-.015l-2.382,2.382V2.605a2.112,2.112,0,0,0-4.223,0V14.043l-2.38-2.382A2.113,2.113,0,0,0,16.8,14.649l6,6a2.071,2.071,0,0,0,1.47.6,2.045,2.045,0,0,0,1.489-.6l6-6A2.113,2.113,0,0,0,31.748,11.676Z"
                      transform="translate(0 -0.5)"
                      fill="#2077fc"
                      fill-rule="evenodd"
                    ></path>
                    <path
                      id="Combined-Shape-2"
                      data-name="Combined-Shape"
                      d="M13.831,5.616c.063-.063.137-.106.2-.167a10.488,10.488,0,0,0-3.476-.633,10.558,10.558,0,1,0,9.183,15.67L13.818,14.56A6.32,6.32,0,0,1,13.831,5.616Z"
                      transform="translate(0 2.575)"
                      fill="#fefefe"
                      fill-rule="evenodd"
                    ></path>
                  </svg>
                </span>
                <span class="notification-item-status"></span>
                <input type="hidden" name="url" value="/user/balance?currency=USDT" />
                <input type="hidden" name="type" value="DEPOSIT_SUCCESS" />
              </div>
              <span class="notification-item-time">${formatTimestamp(
                item.time,
                'MM/DD/YY HH:mm:ss'
              )}</span>
            </li>
          `;
      else
        return item.var === 'internal'
          ? `
            <li class="notification-item">
              <div>
                <h4 class="notification-item-title">Rút tiền nội bộ thành công</h4>
                <p class="notification-item-text">
                  - Số lượng: <b class="textnote-notidesc">${formatNumber(
                    item.amount
                  )} USDT</b><br />
                  - Memo: <b class="textnote-notidesc">${item.note}</b><br />
                  - Người nhận: <b class="textnote-notidesc">${item.nickname}</b>
                </p>
                <span class="notification-item-time">${formatTimestamp(
                  item.time,
                  'YYYY-MM-DD HH:mm:ss'
                )} (UTC)</span>
                <span class="notification-item-icon">
                  <svg
                    id="Group_21412"
                    data-name="Group 21412"
                    xmlns="http://www.w3.org/2000/svg"
                    width="30.338"
                    height="28.644"
                    viewBox="0 0 30.338 28.644"
                  >
                    <g id="icon-withdraw-red" transform="translate(0 0)">
                      <g id="icon-withdraw">
                        <path
                          id="Combined-Shape"
                          d="M16.362,18.069V13.942a6.052,6.052,0,0,1-5.749-5.721c-.131,0-.252-.037-.383-.037a10.23,10.23,0,1,0,8.976,15.04A6.122,6.122,0,0,1,16.362,18.069ZM24.546,6.985l2.308,2.308A2.046,2.046,0,0,0,29.746,6.4L23.934.585a2.05,2.05,0,0,0-2.868,0L15.253,6.4a2.046,2.046,0,0,0,2.893,2.893l2.308-2.308V18.068a2.046,2.046,0,0,0,4.092,0Z"
                          transform="translate(0 0)"
                          fill="#2077FC"
                          fill-rule="evenodd"
                        ></path>
                      </g>
                    </g>
                    <g
                      id="icon-withdraw-red-2"
                      data-name="icon-withdraw-red"
                      transform="translate(0 8.184)"
                    >
                      <g id="icon-withdraw-2" data-name="icon-withdraw">
                        <path
                          id="Combined-Shape-2"
                          data-name="Combined-Shape"
                          d="M16.362,15.024V10.9a6.052,6.052,0,0,1-5.749-5.721c-.131,0-.252-.037-.383-.037a10.23,10.23,0,1,0,8.976,15.04A6.122,6.122,0,0,1,16.362,15.024Z"
                          transform="translate(0 -5.14)"
                          fill="#FEFEFE"
                          fill-rule="evenodd"
                        ></path>
                      </g>
                    </g>
                  </svg>
                </span>
                <span class="notification-item-status"></span>
                <input type="hidden" name="url" value="/user/balance?currency=USDT" />
              </div>
              <span class="notification-item-time">${formatTimestamp(
                item.time,
                'MM/DD/YY HH:mm:ss'
              )}</span>
            </li>
          `
          : `
            <li class="notification-item">
              <div>
                <h4 class="notification-item-title">Rút tiền thành công</h4>
                <p class="notification-item-text">
                  Bạn đã rút thành công <b class="textnote-notidesc">${formatNumber(
                    item.amount
                  )} USDT</b>.
                </p>
                <span class="notification-item-time">2023-07-17 10:53:22 (UTC)</span>
                <span class="notification-item-icon">
                  <svg
                    id="Group_21412"
                    data-name="Group 21412"
                    xmlns="http://www.w3.org/2000/svg"
                    width="30.338"
                    height="28.644"
                    viewBox="0 0 30.338 28.644"
                  >
                    <g id="icon-withdraw-red" transform="translate(0 0)">
                      <g id="icon-withdraw">
                        <path
                          id="Combined-Shape"
                          d="M16.362,18.069V13.942a6.052,6.052,0,0,1-5.749-5.721c-.131,0-.252-.037-.383-.037a10.23,10.23,0,1,0,8.976,15.04A6.122,6.122,0,0,1,16.362,18.069ZM24.546,6.985l2.308,2.308A2.046,2.046,0,0,0,29.746,6.4L23.934.585a2.05,2.05,0,0,0-2.868,0L15.253,6.4a2.046,2.046,0,0,0,2.893,2.893l2.308-2.308V18.068a2.046,2.046,0,0,0,4.092,0Z"
                          transform="translate(0 0)"
                          fill="#2077fc"
                          fill-rule="evenodd"
                        ></path>
                      </g>
                    </g>
                    <g
                      id="icon-withdraw-red-2"
                      data-name="icon-withdraw-red"
                      transform="translate(0 8.184)"
                    >
                      <g id="icon-withdraw-2" data-name="icon-withdraw">
                        <path
                          id="Combined-Shape-2"
                          data-name="Combined-Shape"
                          d="M16.362,15.024V10.9a6.052,6.052,0,0,1-5.749-5.721c-.131,0-.252-.037-.383-.037a10.23,10.23,0,1,0,8.976,15.04A6.122,6.122,0,0,1,16.362,15.024Z"
                          transform="translate(0 -5.14)"
                          fill="#fefefe"
                          fill-rule="evenodd"
                        ></path>
                      </g>
                    </g>
                  </svg>
                </span>
                <span class="notification-item-status"></span>
                <input type="hidden" name="url" value="/user/balance?currency=USDT" />
              </div>
              <span class="notification-item-time">${formatTimestamp(
                item.time,
                'MM/DD/YY HH:mm:ss'
              )}</span>
            </li>
            `;
    })
    .join('');
  const comHtml = `
    <li class="notification-item">
      <div>
        <h4 class="notification-item-title">Bạn đã nhận Hoa hồng Giao dịch</h4>
        <p class="notification-item-text">
          Bạn đã nhận thành công Hoa hồng Giao dịch trị giá
          <b class="textnote-notidesc">${formatNumber(comAmount)}</b>
          <b class="textnote-notidesc">USDT</b> cho ngày
          <b class="textnote-notidesc">${formatTimestamp(yesterday.getTime(), 'MM-DD-YYYY')}</b>.
        </p>
        <span class="notification-item-time">DD-MM-YYYY 00:05:57 (UTC)</span>
        <span class="notification-item-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="33.016"
            height="30.284"
            viewBox="0 0 33.016 30.284"
          >
            <g
              id="_000000ff"
              data-name="#000000ff"
              transform="translate(-26.902 -33.003)"
            >
              <path
                id="Path_35579"
                data-name="Path 35579"
                d="M33.929,37.792a15.017,15.017,0,0,1,16.414-3.763,15.16,15.16,0,1,1-20.7,13.829,15.5,15.5,0,0,1-1.663,1.584c-.653.33-1.419-.6-.913-1.15.915-.963,1.869-1.889,2.809-2.825a.812.812,0,0,1,1.238.05c.942.958,1.941,1.871,2.834,2.875.375.624-.441,1.381-1.042,1.024a17.62,17.62,0,0,1-1.623-1.587,13.905,13.905,0,0,0,3.3,9.142A13.589,13.589,0,1,0,45.925,34.589a13.421,13.421,0,0,0-10.694,4.018C34.7,39.317,33.56,38.56,33.929,37.792Z"
                transform="translate(0 0)"
                fill="#fefefe"
              ></path>
              <path
                id="Path_35580"
                data-name="Path 35580"
                d="M78.428,72.655a3.029,3.029,0,1,1-1.737,3.415,3.019,3.019,0,0,1,1.737-3.415m.72,1.408a1.4,1.4,0,1,0,1.769,1.753A1.429,1.429,0,0,0,79.149,74.063Z"
                transform="translate(-38.736 -30.74)"
                fill="#3381f9"
              ></path>
              <path
                id="Path_35581"
                data-name="Path 35581"
                d="M90.456,74.756a.794.794,0,0,1,1.34.582c.014.326-.251.549-.448.77-3.419,3.4-6.812,6.824-10.234,10.218a.816.816,0,0,1-1.406-.422c-.059-.408.282-.683.528-.946C83.653,81.566,87.034,78.14,90.456,74.756Z"
                transform="translate(-41.094 -32.359)"
                fill="#2077fc"
              ></path>
              <path
                id="Path_35582"
                data-name="Path 35582"
                d="M112.2,102.056a3.031,3.031,0,1,1-2.093,3.623,3.07,3.07,0,0,1,2.093-3.623m.232,1.622a1.4,1.4,0,1,0,1.969,1.514A1.407,1.407,0,0,0,112.433,103.678Z"
                transform="translate(-64.299 -53.342)"
                fill="#2077fc"
              ></path>
            </g></svg
        ></span>
        <span class="notification-item-status"></span>
        <input type="hidden" name="url" value="/affiliate/commission" />
      </div>
      <span class="notification-item-time">${formatTimestamp(
        today.getTime(),
        'MM/DD/YY'
      )} 07:05:57</span>
    </li>
  `;
  const botHtml = `
    <li class="notification-item">
      <div>
        <h4 class="notification-item-title">Tóm tắt Kết quả Thử Thách Liên Hoàn</h4>
        <p class="notification-item-text">
          Có tổng cộng <b class="textnote-notidesc">109</b> tài khoản đã trúng giải
          Độc Đắc trị giá <b class="textnote-notidesc">$4,578.39</b> và tài khoản
          <b class="textnote-notidesc">Bao1322</b> đã trúng giải Mega trị giá
          <b class="textnote-notidesc">$105.87</b> vào ngày hôm qua.
        </p>
        <span class="notification-item-time">DD-MM-YY 1:00:00 AM UTC</span>
        <span class="notification-item-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="17.281"
            height="17.281"
            viewBox="0 0 56.602 61.9"
          >
            <g id="bell" transform="translate(-3.699 -1)">
              <path
                id="Path_35094"
                data-name="Path 35094"
                d="M57.2,39.5c-2-2.2-4.2-4.7-4.2-9.5V21.8C53,10.7,43.2,1,32,1S11,10.8,11,22v8c0,4.8-2.2,7.3-4.2,9.5C5.2,41.3,3.7,43,3.7,45.6c0,5.5,11.4,9.2,28.3,9.2s28.3-3.7,28.3-9.2C60.3,43.1,58.8,41.3,57.2,39.5Z"
                fill="#fff"
              ></path>
              <path
                id="Path_35095"
                data-name="Path 35095"
                d="M32,56.8a81.35,81.35,0,0,1-8.8-.4A9.062,9.062,0,0,0,32,62.9a9.181,9.181,0,0,0,8.8-6.5A81.35,81.35,0,0,1,32,56.8Z"
                fill="#fff"
              ></path>
            </g>
          </svg>
        </span>
        <span class="notification-item-status"></span>
        <input type="hidden" name="url" value="/streak-challenge" />
      </div>
      <span class="notification-item-time">${formatTimestamp(
        today.getTime(),
        'MM/DD/YY'
      )} 07:59:59</span>
    </li>
  `;
  let html = `
    <ul class="notification-list list-unstyled">
  `;
  html +=
    Date.now() < comTime.getTime()
      ? transHtmlAffer + transHtmlBefore + botHtml + comHtml + '</ul>'
      : transHtmlAffer + comHtml + transHtmlBefore + botHtml + '</ul>';
  sectionNotiList.innerHTML = html;
};

const openNoti = (id) => {
  const notiBell = document.querySelector('div.notification-dropdown-button');
  if (notiBell) {
    notiBell.onclick = () => {
      chrome.runtime.sendMessage({ action: 'getLocalStorage', key: 'trans_his' }, (res) => {
        transHisData = res.value ? res.value : [];
        renderNotiList(transHisData, comAmount);
      });
    };
    if (id) clearInterval(id);
  }
};

const openNotiInterval = setInterval(() => {
  openNoti(openNotiInterval);
}, 200);

const withdrawClickInterval = setInterval(() => {
  const aEl = document.querySelectorAll('a.colorSecondary.font-12.decoration-none');
  let maxAssets = 0;

  if (aEl[1]) {
    aEl[1].addEventListener('click', () => {
      document.querySelector('span.number').innerHTML = formatNumber(USDT);
      const maxBtn = document.querySelector('button.btn.sendMax.button.primary');
      const inputEls = document.querySelectorAll('div.form-group.position-relative input');
      const sendBtn = document.querySelector('button.buttonCommon.redButton');

      maxBtn.onclick = () => {
        maxAssets = totalAssets - liveAccount;
        inputEls[0].value = maxAssets;
      };

      sendBtn.onclick = () => {
        withdrawValue = {
          amount: inputEls[0].value,
          recipient: inputEls[1].value,
          memo: inputEls[2].value,
        };
        const submitBtn = document.querySelector('button.btn-confirm');
        if (submitBtn) {
          submitBtn.onclick = () => {
            const closeBtn = document.querySelector('button[data-v-7a597416]');
            const notiBlock = document.querySelector('div[data-v-049fb53f]');
            notiBlock.innerHTML = '';
            closeBtn.click();
            let transHisData = [];

            const trans = {
              id: genId(),
              time: Date.now(),
              amount:
                parseFloat(maxAssets) > 0
                  ? parseFloat(maxAssets)
                  : parseFloat(withdrawValue.amount),
              nickname: withdrawValue.recipient,
              note: withdrawValue.memo,
              var: 'internal',
              type: 'withdraw',
            };
            chrome.runtime.sendMessage({ action: 'getLocalStorage', key: 'trans_his' }, (res) => {
              if (res.value) {
                transHisData = res.value;
              }
              let html = genTransHisTitle();
              html += [{ ...trans, status: 'new' }, ...transHisData]
                .map((item) => genTransHisHTML(item))
                .join('');
              const ulEl = document.querySelector(
                'ul.list-unstyled.borderTopUnset.m-0.borderSecondary2.bgSecondary4.boxResult-content.overflow-hidden'
              );
              ulEl.innerHTML = html;
              transHisData.unshift(trans);
              transHisData.sort((a, b) => b.time - a.time);
              chrome.runtime.sendMessage({
                action: 'setLocalStorage',
                data: { trans_his: transHisData },
              });
              const newAssets = parseFloat(totalAssets) - trans.amount;
              totalAssets = newAssets;
              chrome.runtime.sendMessage({
                action: 'setLocalStorage',
                data: { total_assets: newAssets },
              });

              setTimeout(() => {
                const notiBlock = document.querySelector('div[data-v-049fb53f]');
                notiBlock.innerHTML = `
                  <div data-v-049fb53f="" class="wrapMainNotify top">
                    <div data-v-049fb53f="" id="37954215">
                      <div data-v-049fb53f="" class="wrapNotify success">
                        <div data-v-049fb53f="" class="boxNotify">
                          <div data-v-049fb53f="" class="d-flex align-items-center">
                            <div data-v-049fb53f="">
                              <span data-v-049fb53f="" class="icon"
                                ><svg
                                  data-v-049fb53f=""
                                  xmlns="http://www.w3.org/2000/svg"
                                  aria-hidden="true"
                                  data-prefix="fas"
                                  data-icon="check"
                                  role="img"
                                  viewBox="0 0 512 512"
                                  class="svg-inline--fa fa-check fa-w-16"
                                >
                                  <path
                                    data-v-049fb53f=""
                                    fill="currentColor"
                                    d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"
                                  ></path></svg
                              ></span>
                            </div>
                            <div data-v-049fb53f="" class="ml-2">
                              <div data-v-049fb53f="" class="boxContent">
                                <span data-v-049fb53f="" class="message"
                                  >Rút tiền thành công</span
                                >
                              </div>
                            </div>
                          </div>
                          <span data-v-049fb53f=""
                            ><svg
                              data-v-049fb53f=""
                              xmlns="http://www.w3.org/2000/svg"
                              width="34"
                              height="34"
                              viewBox="0 0 34 34"
                              class="close-notify"
                            >
                              <g
                                data-v-049fb53f=""
                                id="Group_11134"
                                data-name="Group 11134"
                                transform="translate(-1268 -28)"
                              >
                                <circle
                                  data-v-049fb53f=""
                                  id="Ellipse_201"
                                  data-name="Ellipse 201"
                                  cx="17"
                                  cy="17"
                                  r="17"
                                  transform="translate(1268 28)"
                                  opacity="0.081"
                                ></circle>
                                <g data-v-049fb53f="" id="e-remove" transform="translate(1278.49 38.49)">
                                  <path
                                    data-v-049fb53f=""
                                    id="Path_13784"
                                    data-name="Path 13784"
                                    d="M13.742,1.279a.9.9,0,0,0-1.3,0L7.51,6.208,2.581,1.279a.9.9,0,0,0-1.3,0,.9.9,0,0,0,0,1.3L6.208,7.51,1.279,12.44a.9.9,0,0,0,0,1.3.844.844,0,0,0,.651.279.844.844,0,0,0,.651-.279L7.51,8.813l4.929,4.929a.9.9,0,0,0,1.3,0,.9.9,0,0,0,0-1.3L8.813,7.51l4.929-4.929A.9.9,0,0,0,13.742,1.279Z"
                                    transform="translate(-1 -1)"
                                    fill="#fff"
                                  ></path>
                                </g>
                              </g></svg
                          ></span>
                        </div>
                      </div>
                    </div>
                  </div>
                `;
                let html = genTransHisTitle();
                html += transHisData.map((item) => genTransHisHTML(item)).join('');
                changeAssets(totalAssets);
                const ulEl = document.querySelector(
                  'ul.list-unstyled.borderTopUnset.m-0.borderSecondary2.bgSecondary4.boxResult-content.overflow-hidden'
                );
                const notiCount = document.querySelector(
                  'span.notification-dropdown-button-number'
                );
                if (notiCount) notiCount.innerHTML = transHisData.length + 2;
                else {
                  document.querySelector('div.notification-dropdown-button').innerHTML += `
                  <span class="notification-dropdown-button-number">${
                    transHisData.length + 2
                  }</span>
                `;
                }
                openNoti();
                document
                  .querySelector('span.notification-dropdown-button-icon')
                  .classList.add('has-new-notification');
                ulEl.innerHTML = html;
                setTimeout(() => {
                  notiBlock.innerHTML = '';
                  document
                    .querySelector('span.notification-dropdown-button-icon')
                    .classList.remove('has-new-notification');
                }, 3000);
              }, 7000);
            });
          };
        }
      };

      clearInterval(withdrawClickInterval);
    });
  }
}, 200);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'navigate') {
    currTab = 'trans';
    if (request.data === 'https://fibowin5.com/user/balance') {
      changeAssets(totalAssets);
      renderHisTable(transHisData);
    }
    if (request.data === 'https://fibowin5.com/user/binary-wallet') {
      changeBalance('span.user-balance', totalAssets);
    }
  } else if (request.action === 'rerenderTransHis') {
    if (request.data) {
      totalAssets += request.data;
      changeAssets(totalAssets);
      chrome.runtime.sendMessage({
        action: 'setLocalStorage',
        data: { total_assets: totalAssets },
      });
    }
    chrome.runtime.sendMessage({ action: 'getLocalStorage', key: 'trans_his' }, (res) => {
      transHisData = res.value ? res.value : [];
      if (currTab === 'trans') renderHisTable(transHisData);
      renderNotiList(transHisData, comAmount);
      const notiCount = document.querySelector('span.notification-dropdown-button-number');
      if (notiCount) notiCount.innerHTML = transHisData.length + 2;
      else {
        document.querySelector('div.notification-dropdown-button').innerHTML += `
        <span class="notification-dropdown-button-number">${transHisData.length + 2}</span>
      `;
      }
    });
  } else if (request.action === 'rerenderAssets') {
    changeAssets(resq.data);
  } else if (request.action === 'rerenderCom') {
    comAmount = request.data;
    renderHisTable(comAmount);
    chrome.runtime.sendMessage({
      action: 'setLocalStorage',
      data: { com_his: comAmount },
    });
  }
});

window.addEventListener('load', () => {
  chrome.runtime.sendMessage({ action: 'contentScriptReady' });
});

const getLiveAccount = setInterval(() => {
  const amountEl = document.querySelectorAll('span.font-26.font-weight-700');
  if (amountEl && amountEl.length > 0) {
    liveAccount = parseFloat(amountEl[1].textContent.replace(/,/, ''));
    USDT = totalAssets - liveAccount;

    amountEl[0].innerHTML = formatNumber(USDT);
    changeAssets(totalAssets);
    clearInterval(getLiveAccount);
  }
}, 50);

const switchAccountInterval = setInterval(() => {
  const switchBtn = document.querySelector('div.changeAmount.pointer');
  if (switchBtn) {
    switchBtn.addEventListener('click', () => {
      const amountEl = document.querySelectorAll('span.font-26.font-weight-700');
      firstWallet = firstWallet === 'USDT' ? 'live' : 'USDT';
      amountEl[0].innerHTML =
        firstWallet === 'USDT' ? formatNumber(USDT) : formatNumber(liveAccount);
      amountEl[1].innerHTML =
        firstWallet !== 'USDT' ? formatNumber(USDT) : formatNumber(liveAccount);
    });
    clearInterval(switchAccountInterval);
  }
}, 100);

// const tranferInterval = setInterval(() => {
//   const tranferBtn = document.querySelector(
//     'button.button.btn-border-radius.btn-large.primary.w-75.font-weight-bold'
//   );
//   if (tranferBtn) {
//     tranferBtn.onclick = () => {

//     }
//   }
// });
