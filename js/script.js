let transHis = [];

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

const genId = (length = 3) => Math.random().toString(36).slice(-length);

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

const assetsForm = document.getElementById('assets-form');
assetsForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const inputEl = document.getElementById('assets');
  const val = parseFloat(inputEl.value);
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'rerenderAssets',
      data: val,
    });
  });
  chrome.runtime.sendMessage({ action: 'setLocalStorage', data: { total_assets: val } });
  inputEl.value = '';
});

const depositForm = document.getElementById('deposit-form');
depositForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const time = document.getElementById('deposit-time');
  const amount = document.getElementById('deposit-amount');
  const sender = document.getElementById('sender-nickname');
  const note = document.getElementById('deposit-note');
  const type = document.getElementById('is-deposit-internal');

  const trans = {
    id: genId(),
    time: time.value ? new Date(time.value.split(' ').join('T')).getTime() : Date.now(),
    amount: parseFloat(amount.value),
    nickname: sender.value,
    note: note.value,
    type: 'deposit',
    var: type.checked ? 'internal' : 'external',
  };
  transHis.unshift(trans);
  transHis.sort((a, b) => b.time - a.time);
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.runtime.sendMessage({ action: 'setLocalStorage', data: { trans_his: transHis } }, () => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'rerenderTransHis',
        data: trans.amount,
      });
    });
  });
  time.value = '';
  amount.value = '';
  sender.value = '';
  note.value = '';
  type.value = '';

  renderTransHisBody(transHis);
});

const comForm = document.getElementById('add-com-form');
comForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const comVal = document.getElementById('add-com');
  const comAmount = parseFloat(comVal.value);

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'rerenderCom',
      data: comAmount,
    });
  });
  comVal.value = '';
});

const clearTransHis = document.getElementById('clear-trans-his');
clearTransHis.addEventListener('click', () => {
  const cf = confirm('Bạn có muốn xoá toàn bộ lịch sử giao dịch không?');
  if (cf) {
    chrome.runtime.sendMessage(
      {
        action: 'removeLocalStorage',
        key: 'trans_his',
      },
      () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const activeTab = tabs[0];
          chrome.tabs.sendMessage(activeTab.id, {
            action: 'rerenderTransHis',
          });
        });
      }
    );
    alert('Xoá lịch sử thành công!');
    transHis = [];
    renderTransHisBody([]);
  }
});

const clearComHis = document.getElementById('clear-com-btn');
clearComHis.addEventListener('click', () => {
  const cf = confirm('Bạn có muốn xoá hoa hồng không?');
  if (cf) {
    chrome.runtime.sendMessage({
      action: 'removeLocalStorage',
      key: 'com_his',
    });
    alert('Xoá lịch sử thành công!');
  }
});

const renderTransHisBody = (data) => {
  console.log(data);
  const tableBody = document.getElementById('his-table-body');
  tableBody.innerHTML = data
    .map(
      (item, index) => `
        <tr>
          <th scope="row">${index + 1}</th>
          <td>${formatTimestamp(item.time, 'DD/MM/YYYY HH:mm:ss')}</td>
          <td>${item.type === 'deposit' ? '+' : '-'}${formatNumber(item.amount)}</td>
          <td>${item.type === 'deposit' ? 'Nạp tiền' : 'Rút tiền'} ${
        item.var === 'internal' ? '(Nội bộ)' : ''
      }</td>
          <td>${item.type === 'deposit' ? 'Từ' : 'Đến'}: ${
        item.nickname?.length > 13 ? `${item.nickname.slice(0, 10)}...` : item.nickname
      }</td>
          <td> ${item.note?.length > 13 ? `${item.note.slice(0, 10)}...` : item.note}</td>
          <td><button type="button" class="btn btn-danger delete-trans" data-id="${
            item.id
          }">Xoá</button></td>
        </tr>
      `
    )
    .join('');

  deleteTransHis();
};

chrome.runtime.sendMessage({ action: 'getLocalStorage', key: 'trans_his' }, (res) => {
  if (res.value) {
    transHis = res.value;
    renderTransHisBody(transHis);
  }
});

const deleteTransHis = () => {
  const deleteBtns = document.querySelectorAll('button.delete-trans');
  deleteBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const cf = confirm('Bạn chắc chắn muốn xoá giao dịch này?');
      if (cf) {
        transHis = transHis.filter((item) => item.id !== id);
        chrome.runtime.sendMessage(
          { action: 'setLocalStorage', data: { trans_his: transHis } },
          () => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              const activeTab = tabs[0];
              chrome.tabs.sendMessage(activeTab.id, {
                action: 'rerenderTransHis',
              });
            });
          }
        );
        renderTransHisBody(transHis);
      }
    });
  });
};

document.onload = () => {
  deleteTransHis();
};
