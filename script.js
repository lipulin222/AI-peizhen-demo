/* =============================================
 * AI陪诊demo - 客服咨询交互脚本
 * 点击快捷问题 / 发送消息 → 模拟 AI 回复
 * ============================================= */
(function () {
  "use strict";

  var chat = document.getElementById("chat");
  var input = document.getElementById("input");
  var sendBtn = document.getElementById("sendBtn");

  var currentLang = "zh";

  var ACTION_REPLY = {
    arrival: {
      zh: "前往前台报到流程：\n1) 在前台出示预约手机号/身份证；\n2) 领取就诊单与排号；\n3) 在候诊区稍坐，等叫号后进入诊室。",
      en: "Front desk check-in:\n1) Show your booking phone/ID at the desk;\n2) Get your visit slip and queue number;\n3) Wait in the seating area and enter the room when called."
    },
    restroom: {
      zh: "卫生间位置：从大厅前台向左直走即可看到；如需无障碍卫生间，请咨询前台工作人员。",
      en: "Restroom: walk straight left from the lobby front desk; for an accessible restroom, ask the front desk."
    },
    records: {
      zh: "已为您打开「诊疗记录」：这里可以看到您过往的就诊记录、检查报告和预约信息。",
      en: "Opening your Visit Records: here you can see past visits, reports, and booking info."
    },
    human: {
      zh: "正在为您转接人工客服… 当前排队人数：3 人，预计等待约 1 分钟。您也可以先继续和我描述问题。",
      en: "Connecting you to human support… Currently 3 in queue, about 1 min wait. You can also keep describing your issue to me."
    }
  };

  var STEP_REPLY = {
    navigate: {
      zh: "已为您打开本地地图，正在规划路线至：上海市静安区长安路958号静安国际中心C座L203单元。",
      en: "Opened local map, routing to: Unit L203, Block C, Jing'an International Center, No. 958 Changan Road, Jing'an District, Shanghai."
    }
  };

  function t(obj) { return obj ? (currentLang === "en" ? obj.en : obj.zh) : ""; }

  /* ---------- 公共文案常量：第四/五步「查看病历详情」段落（两处共用一份模板） ---------- */
  var MEDICAL_RECORD_PARA = {
    zh: '您已完成面诊并确认治疗方案 <span class="hl medical-link" role="button" tabindex="0">查看病历详情</span>',
    en: 'Consultation is done and the treatment plan is confirmed. <span class="hl medical-link" role="button" tabindex="0">View Medical Record</span>'
  };

  function renderMedicalRecordParas() {
    var html = MEDICAL_RECORD_PARA[currentLang === "en" ? "en" : "zh"];
    document.querySelectorAll(".js-medical-record").forEach(function (p) {
      p.innerHTML = html;
    });
  }
  renderMedicalRecordParas();

  /* ---------- 工具：创建 DOM ---------- */
  function el(tag, className, html) {
    var e = document.createElement(tag);
    if (className) e.className = className;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function appendUserMsg(text) {
    var msg = el("div", "msg msg--user");
    var bubble = el("div", "bubble bubble--user");
    bubble.textContent = text;
    msg.appendChild(bubble);
    chat.appendChild(msg);
    scrollToBottom();
  }

  function appendBotMsg(text) {
    var msg = el("div", "msg msg--bot");
    var avatar = el("div", "avatar avatar--bot");
    avatar.innerHTML = '<span class="avatar__eye avatar__eye--left"></span><span class="avatar__eye avatar__eye--right"></span>';
    var bubble = el("div", "bubble bubble--bot");
    bubble.textContent = text;
    msg.appendChild(avatar);
    msg.appendChild(bubble);
    chat.appendChild(msg);
    scrollToBottom();
  }

  function appendTyping() {
    var msg = el("div", "msg msg--bot msg--typing-wrap");
    var avatar = el("div", "avatar avatar--bot");
    avatar.innerHTML = '<span class="avatar__eye avatar__eye--left"></span><span class="avatar__eye avatar__eye--right"></span>';
    var bubble = el("div", "bubble bubble--bot bubble--typing");
    bubble.innerHTML = '<span></span><span></span><span></span>';
    msg.appendChild(avatar);
    msg.appendChild(bubble);
    msg.id = "typing";
    chat.appendChild(msg);
    scrollToBottom();
  }

  function removeTyping() {
    var t = document.getElementById("typing");
    if (t && t.parentNode) t.parentNode.removeChild(t);
  }

  function scrollToBottom() {
    chat.scrollTop = chat.scrollHeight;
  }

  /* ---------- 模拟回复 ---------- */
  function replyByText(text, opts) {
    opts = opts || {};
    appendTyping();
    setTimeout(function () {
      removeTyping();
      appendBotMsg(text);
      if (typeof opts.then === "function") opts.then();
    }, opts.delay || 600);
  }

  /* ---------- 1) 底部快捷入口 ---------- */
  document.querySelectorAll(".quick-link").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var key = btn.getAttribute("data-action");
      var label = btn.textContent.trim();
      appendUserMsg(label);
      replyByText(t(ACTION_REPLY[key]) || (currentLang === "en" ? "Okay, opening " + label + " for you…" : "好的，正在为您打开 " + label));
    });
  });

  /* ---------- 2) 步骤卡：导航按钮 ---------- */
  document.querySelectorAll(".step-card__action").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var key = btn.getAttribute("data-step-action");
      var label = btn.textContent.trim();
      // 按钮点击后即禁用，避免重复触发
      btn.disabled = true;
      btn.style.opacity = "0.6";
      appendUserMsg(label);
      replyByText(t(STEP_REPLY[key]) || (currentLang === "en" ? "Okay, handling " + label + " for you…" : "好的，正在为您处理 " + label));
    });
  });

  /* ---------- 3) 步骤卡：已抵达诊所（未确认 → 已确认） ---------- */
  var step1 = document.getElementById("step1");
  var step2 = document.getElementById("step2");
  var step3 = document.getElementById("step3");
  var step4 = document.getElementById("step4");
  var step5 = document.getElementById("step5");
  var step6 = document.getElementById("step6");
  var step7 = document.getElementById("step7");
  var recordModal = document.getElementById("recordModal");
  var billModal = document.getElementById("billModal");
  var careModal = document.getElementById("careModal");
  document.querySelectorAll(".step-card__confirm").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (btn.classList.contains("is-confirmed")) return;
      // 从未确认变为已确认
      btn.classList.add("is-confirmed");
      btn.disabled = true;
      // 第一步卡片置灰收起
      if (step1) {
        step1.querySelector(".step-card").classList.add("is-done");
      }
      // 弹出第二步卡片
      if (step2) {
        step2.hidden = false;
        scrollToBottom();
      }
    });
  });

  /* ---------- 4) 收拢卡片：点击标题栏重新展开 ---------- */
  document.querySelectorAll(".step-card__title[data-step-toggle]").forEach(function (title) {
    title.addEventListener("click", function (e) {
      var card = title.closest(".step-card");
      if (card && card.classList.contains("is-done")) {
        card.classList.remove("is-done");
        e.stopPropagation(); // 阻止冒泡，避免触发整卡收起逻辑
      }
    });
  });

  /* ---------- 5) 第二步整卡点击：收起并弹出第三步 ---------- */
  var step2Card = step2 ? step2.querySelector(".step-card") : null;
  if (step2Card) {
    step2Card.addEventListener("click", function () {
      if (step2Card.classList.contains("is-done")) return;
      step2Card.classList.add("is-done");
      if (step3) {
        step3.hidden = false;
        scrollToBottom();
      }
    });
  }

  /* ---------- 6) 第三步整卡点击：收起并弹出第四步（缴费） ---------- */
  var step3Card = step3 ? step3.querySelector(".step-card") : null;
  if (step3Card) {
    step3Card.addEventListener("click", function () {
      if (step3Card.classList.contains("is-done")) return;
      step3Card.classList.add("is-done");
      if (step4) {
        step4.hidden = false;
        scrollToBottom();
      }
    });
  }

  /* ---------- 7) 第四步整卡点击：收起并弹出第五步（敷麻药） ---------- */
  var step4Card = step4 ? step4.querySelector(".step-card") : null;
  if (step4Card) {
    step4Card.addEventListener("click", function (e) {
      if (e.target.closest(".medical-link, .bill-link, .care-link")) return;
      if (step4Card.classList.contains("is-done")) return;
      step4Card.classList.add("is-done");
      if (step5) {
        step5.hidden = false;
        scrollToBottom();
      }
    });
  }

  /* ---------- 8) 第五步整卡点击：收起并弹出第六步（注射） ---------- */
  var step5Card = step5 ? step5.querySelector(".step-card") : null;
  if (step5Card) {
    step5Card.addEventListener("click", function (e) {
      if (e.target.closest(".medical-link, .bill-link, .care-link")) return;
      if (step5Card.classList.contains("is-done")) return;
      step5Card.classList.add("is-done");
      if (step6) {
        step6.hidden = false;
        scrollToBottom();
      }
    });
  }

  /* ---------- 9) 第六步整卡点击：收起并弹出第七步（术后护理） ---------- */
  var step6Card = step6 ? step6.querySelector(".step-card") : null;
  if (step6Card) {
    step6Card.addEventListener("click", function () {
      if (step6Card.classList.contains("is-done")) return;
      step6Card.classList.add("is-done");
      if (step7) {
        step7.hidden = false;
        scrollToBottom();
      }
    });
  }

  /* ---------- 链接：弹出整屏页（事件委托，兼容语言切换后重建的节点） ---------- */
  document.addEventListener("click", function (e) {
    var link = e.target.closest(".medical-link, .bill-link, .care-link");
    if (!link) return;
    e.preventDefault();
    e.stopPropagation();
    if (link.classList.contains("medical-link") && recordModal) recordModal.hidden = false;
    else if (link.classList.contains("bill-link") && billModal) billModal.hidden = false;
    else if (link.classList.contains("care-link") && careModal) careModal.hidden = false;
  });

  /* ---------- 11) 我要线上支付：toast 提示 ---------- */
  document.querySelectorAll(".pay-btn").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      showToast(currentLang === "en" ? "Online payment demo: redirecting to WeChat/Alipay checkout" : "线上支付功能演示：即将跳转微信/支付宝收银台");
    });
  });

  /* ---------- 12) 统一关闭整屏页（返回按钮） ---------- */
  document.querySelectorAll(".modal").forEach(function (m) {
    m.querySelectorAll("[data-close]").forEach(function (el) {
      el.addEventListener("click", function () {
        m.hidden = true;
      });
    });
  });

  /* ---------- toast 轻提示 ---------- */
  function showToast(message) {
    var t = document.getElementById("toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "toast";
      t.className = "toast";
      document.body.appendChild(t);
    }
    t.textContent = message;
    t.classList.add("is-show");
    clearTimeout(t._timer);
    t._timer = setTimeout(function () {
      t.classList.remove("is-show");
    }, 2200);
  }

  /* ---------- 13) 输入栏发送 ---------- */
  function trySend() {
    var text = (input.value || "").trim();
    if (!text) return;
    appendUserMsg(text);
    input.value = "";

    var ans;
    if (/你好|hi|hello|您好/i.test(text)) ans = currentLang === "en" ? "Hello! I'm your Distinct Healthcare AI Companion Assistant. How can I help you today?" : "您好！我是卓正AI陪诊助手，请问需要我帮您什么？";
    else ans = currentLang === "en"
      ? "Got it, I've received your question: \"" + text + "\". Looking it up for you, please wait…"
      : "好的，已收到您的问题：「" + text + "」。我正在为您查询，请稍候…";

    replyByText(ans);
  }

  if (sendBtn) sendBtn.addEventListener("click", trySend);
  if (input) {
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        trySend();
      }
    });
  }

  /* ---------- 语言切换：EN / 中文 ---------- */
  var langToggle = document.getElementById("langToggle");

  function applyLang(lang) {
    currentLang = lang;
    document.querySelectorAll("[data-en]").forEach(function (el) {
      if (lang === "en") {
        if (!el.dataset.zh) el.dataset.zh = el.innerHTML;
        el.innerHTML = el.dataset.en;
      } else if (el.dataset.zh) {
        el.innerHTML = el.dataset.zh;
      }
    });
    document.documentElement.lang = lang === "en" ? "en" : "zh-CN";
    document.title = lang === "en" ? "AI Companion Assistant" : "AI陪诊助手";
    if (input) input.placeholder = lang === "en" ? "Type your question here~" : "请输入想问的问题~";
    if (langToggle) langToggle.textContent = lang === "en" ? "中" : "EN";
    renderMedicalRecordParas();
  }

  if (langToggle) {
    langToggle.addEventListener("click", function () {
      applyLang(currentLang === "zh" ? "en" : "zh");
    });
  }
})();