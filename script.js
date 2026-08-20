/* ===========================================
   外籍就医Demo - JavaScript
   交互逻辑：导航、滚动、表单等
   =========================================== */

(function () {
  "use strict";

  /* ---------- 头部滚动效果 ---------- */
  const header = document.getElementById("header");
  const backToTop = document.getElementById("backToTop");

  function onScroll() {
    const scrolled = window.scrollY > 20;

    if (header) {
      header.classList.toggle("is-scrolled", scrolled);
    }

    if (backToTop) {
      backToTop.classList.toggle("is-visible", window.scrollY > 600);
    }

    updateActiveNav();
  }

  /* ---------- 移动端导航 ---------- */
  const navToggle = document.getElementById("navToggle");
  const nav = document.getElementById("nav");

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      const isOpen = nav.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    // 点击导航链接后关闭菜单
    nav.querySelectorAll(".nav__link").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        navToggle.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- 当前激活的导航项 ---------- */
  const navLinks = document.querySelectorAll(".nav__link");
  const sections = document.querySelectorAll("section[id]");

  function updateActiveNav() {
    if (!sections.length || !navLinks.length) return;

    let currentId = "";
    const offset = 120;

    sections.forEach(function (section) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= offset && rect.bottom > offset) {
        currentId = section.id;
      }
    });

    navLinks.forEach(function (link) {
      const href = link.getAttribute("href");
      link.classList.toggle("active", href === "#" + currentId);
    });
  }

  /* ---------- 滚动出现动画 ---------- */
  const revealTargets = [
    ".service-card",
    ".city-card",
    ".about__content",
    ".insurance__content",
    ".contact__info",
    ".section__head",
  ];

  const revealEls = document.querySelectorAll(revealTargets.join(","));

  revealEls.forEach(function (el, index) {
    el.classList.add("reveal");
    // 给同组元素添加延迟，形成依次出现的效果
    const parent = el.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(function (c) {
        return c.classList.contains("reveal");
      });
      const idx = siblings.indexOf(el);
      if (idx >= 0 && idx < 4) {
        el.setAttribute("data-delay", String(idx + 1));
      }
    }
  });

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
    );

    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    // 降级处理：直接显示
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ---------- 语言切换（demo） ---------- */
  const langList = [
    { code: "zh", label: "中文" },
    { code: "en", label: "EN" },
    { code: "ja", label: "日本語" },
  ];
  let langIdx = 0;

  const langSwitch = document.getElementById("langSwitch");
  const langCurrent = document.querySelector(".top-bar__current strong");

  function updateLang() {
    if (langCurrent) langCurrent.textContent = langList[langIdx].label;
  }

  if (langSwitch) {
    langSwitch.addEventListener("click", function () {
      langIdx = (langIdx + 1) % langList.length;
      updateLang();
      if (window.__applyLang) window.__applyLang(langList[langIdx].code);
      window.dispatchEvent(new Event("langchange"));
    });
  }
  // 初始应用当前语言
  if (window.__applyLang) window.__applyLang(langList[langIdx].code);
  updateLang();

  /* ---------- 轮播图 ---------- */
  (function initCarousel() {
    const track = document.getElementById("carouselTrack");
    const prevBtn = document.getElementById("carouselPrev");
    const nextBtn = document.getElementById("carouselNext");
    const dotsContainer = document.getElementById("carouselDots");
    const carouselText = document.getElementById("carouselText");

    if (!track) return;

    // 初始化 transform，避免首次切换瞬移
    track.style.transform = "translateX(0%)";

    const slides = Array.from(track.querySelectorAll(".hero-carousel__slide"));
    const total = slides.length;
    let current = 0;
    let timer = null;
    const INTERVAL = 5000;

    // 7 条文案数据
    const texts = [
      { num: "01", title: "专业认证的医疗资质", desc: "所有合作医生均持有正规执业资格，诊所通过国际医疗质量认证，让您安心就诊。" },
      { num: "02", title: "循证医学为基础的诊疗", desc: "严格遵循国际临床指南，以最新循证医学证据为诊疗依据，拒绝过度医疗。" },
      { num: "03", title: "坚持高性价比的优质服务", desc: "合理透明的收费标准，让您以公道价格享受国际水准的医疗服务。" },
      { num: "04", title: "AI陪诊解决语言障碍", desc: "智能 AI 翻译全程陪同就诊，实时多语种沟通，让外籍患者就医无忧。" },
      { num: "05", title: "支持国际信用卡支付体系", desc: "支持 Visa、Mastercard 等主流国际信用卡，结算便捷，账单清晰可查。" },
      { num: "06", title: "支持对接国际商业保险", desc: "与全球主要商业医疗保险公司直付合作，就诊免垫付，流程更顺心。" },
      { num: "07", title: "提供多语言医疗文书", desc: "诊断报告、处方、病历均可输出中英日韩多语种版本，方便跨境就医与保险理赔。" },
    ];

    // 为每张 slide 设置 tabpanel 语义
    slides.forEach(function (slide, i) {
      slide.setAttribute("role", "tabpanel");
      slide.setAttribute("id", "carousel-slide-" + i);
      slide.setAttribute("aria-label", "第 " + (i + 1) + " 张");
    });

    // 生成指示点
    slides.forEach(function (_, i) {
      const dot = document.createElement("button");
      dot.className = "hero-carousel__dot";
      dot.setAttribute("type", "button");
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "切换到第 " + (i + 1) + " 张");
      dot.setAttribute("aria-controls", "carousel-slide-" + i);
      dot.setAttribute("aria-selected", "false");
      dot.addEventListener("click", function () {
        goTo(i);
        resetTimer();
      });
      dotsContainer.appendChild(dot);
    });

    const dots = Array.from(dotsContainer.children);

    function updateText(index) {
      if (!carouselText) return;
      const t = window.__t ? window.__t("carousel." + (index + 1) + ".title") : texts[index].title;
      const d = window.__t ? window.__t("carousel." + (index + 1) + ".desc") : texts[index].desc;
      carouselText.classList.remove("is-switching");
      // 强制重绘以重新触发动画
      void carouselText.offsetWidth;
      carouselText.classList.add("is-switching");
      carouselText.querySelector(".hero-integrated__overlay-title").textContent = t;
      carouselText.querySelector(".hero-integrated__overlay-desc").textContent = d;
    }

    // 语言切换时刷新轮播文案
    window.addEventListener("langchange", function () { updateText(current); });

    function goTo(index) {
      current = (index + total) % total;
      track.style.transform = "translateX(-" + current * 100 + "%)";

      slides.forEach(function (s, i) {
        s.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (d, i) {
        const active = i === current;
        d.classList.toggle("is-active", active);
        d.setAttribute("aria-selected", String(active));
      });
      updateText(current);
    }

    function next() {
      goTo(current + 1);
    }

    function prev() {
      goTo(current - 1);
    }

    function startTimer() {
      timer = setInterval(next, INTERVAL);
    }

    function resetTimer() {
      if (timer) clearInterval(timer);
      startTimer();
    }

    if (nextBtn) nextBtn.addEventListener("click", function () { next(); resetTimer(); });
    if (prevBtn) prevBtn.addEventListener("click", function () { prev(); resetTimer(); });

    // 鼠标悬停时暂停
    const carousel = document.querySelector(".hero-integrated");
    if (carousel) {
      carousel.addEventListener("mouseenter", function () {
        if (timer) clearInterval(timer);
      });
      carousel.addEventListener("mouseleave", function () {
        startTimer();
      });

      // 触摸滑动支持
      let touchStartX = 0;
      let touchEndX = 0;
      carousel.addEventListener("touchstart", function (e) {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });
      carousel.addEventListener("touchend", function (e) {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 40) {
          if (diff > 0) next();
          else prev();
          resetTimer();
        }
      }, { passive: true });
    }

    // 键盘左右键支持
    document.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { prev(); resetTimer(); }
      else if (e.key === "ArrowRight") { next(); resetTimer(); }
    });

    // 初始化
    goTo(0);
    startTimer();
  })();

  /* ---------- 多步骤问卷弹窗 ---------- */
  (function initQuiz() {
    // i18n 文本辅助函数（整个问卷/方案 IIFE 共享）
    function _T(k, v) { return window.__t ? window.__t(k, v) : ""; }

    // 记录 AI 方案页当前渲染模式，用于切换语言时自动重渲染
    let planMode = "aiplan";
    let lastProjects = null;
    let lastDoctors = null;

    const quiz = document.getElementById("quiz");
    const modal = document.getElementById("quizModal");
    if (!quiz || !modal) return;

    const steps = Array.from(quiz.querySelectorAll(".quiz__step"));
    const total = steps.length;
    let current = 1;

    const progressBar = document.getElementById("quizProgressBar");
    const progressText = document.getElementById("quizProgressText");
    const prevBtn = document.getElementById("quizPrev");
    const nextBtn = document.getElementById("quizNext");
    const submitBtn = document.getElementById("quizSubmit");
    const loadingEl = document.getElementById("quizLoading");
    const aiPlanEl = document.getElementById("quizAiPlan");
    const aiPlanBody = document.getElementById("aiPlanBody");
    const aiPlanConfirm = document.getElementById("aiPlanConfirm");
    const aiPlanPicked = document.getElementById("aiPlanPicked");
    const aiPlanInput = document.getElementById("aiPlanInput");
    const aiPlanSend = document.getElementById("aiPlanSend");
    const q1SubOptions = document.getElementById("q1SubOptions");
    const q1CountrySelect = document.getElementById("q1CountrySelect");
    const calUndecidedBtn = document.getElementById("calUndecided");
    let calRender = null; // 由日历 IIFE 设置

    // 记录每步选择
    const answers = {};

    // ---------- 重置问卷到初始状态 ----------
    function resetQuiz() {
      current = 1;
      Object.keys(answers).forEach(function (k) { delete answers[k]; });
      quiz.querySelectorAll(".quiz__option, .quiz__sub-option, .quiz__quick-country").forEach(function (o) {
        o.classList.remove("is-selected");
      });
      quiz.querySelectorAll("input").forEach(function (i) { i.value = ""; });
      if (q1SubOptions) q1SubOptions.hidden = true;
      if (q1CountrySelect) q1CountrySelect.value = "";
      // 重置日历选中
      if (calUndecidedBtn) calUndecidedBtn.classList.remove("is-selected");
      if (typeof calRender === "function") calRender();
      // 显示问卷区，隐藏中转页和方案页
      quiz.style.display = "";
      if (loadingEl) loadingEl.hidden = true;
      if (aiPlanEl) aiPlanEl.hidden = true;
      updateUI();
    }

    // ---------- 弹窗开关 ----------
    // 每次打开都呼起全新问卷流程
    function openModal() {
      resetQuiz();
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }
    function closeModal() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    // 暴露给右下角 AI 气泡调用
    window.__openQuizModal = openModal;

    // 切换语言时，若 AI 方案页正在展示，用当前语言重渲染其内容
    document.addEventListener("langchange", function () {
      if (aiPlanEl && !aiPlanEl.hidden && aiPlanBody) {
        aiPlanBody.innerHTML = "";
        if (planMode === "book" && lastProjects) {
          renderBookingReply(lastProjects, lastDoctors);
        } else if (planMode === "learn" && lastProjects) {
          renderLearnReply(lastProjects, lastDoctors);
        } else if (planMode === "more") {
          renderMoreOptions();
        } else {
          renderAiPlan();
        }
        aiPlanBody.scrollTop = aiPlanBody.scrollHeight;
      }
    });

    const openBtns = [
      document.getElementById("openQuizBtn"),
      document.getElementById("openQuizBtnHero"),
      document.getElementById("headerRegBtn"),
    ];
    openBtns.forEach(function (b) {
      if (b) b.addEventListener("click", openModal);
    });

    const closeBtn = document.getElementById("quizClose");
    const overlay = document.getElementById("quizOverlay");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (overlay) overlay.addEventListener("click", closeModal);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
    });

    // ---------- 检查 step 是否完成 ----------
    function isStepComplete(stepNum) {
      if (stepNum === 8) {
        const nameEl = quiz.querySelector("[name='quiz_name']");
        const phoneEl = quiz.querySelector("[name='quiz_phone']");
        return nameEl && nameEl.value.trim() && phoneEl && phoneEl.value.trim();
      }
      if (stepNum === 1) {
        // Q1: 海外居民需要选国家；中国境内直接完成
        return !!answers[1];
      }
      return !!answers[stepNum];
    }

    function updateUI() {
      steps.forEach(function (s) {
        s.classList.toggle("is-active", Number(s.dataset.step) === current);
      });

      const pct = (current / total) * 100;
      if (progressBar) progressBar.style.width = pct + "%";
      if (progressText) progressText.textContent = window.__t
        ? window.__t("quiz.progress", { current: current, total: total })
        : "第 " + current + " 步 / 共 " + total + " 步";

      if (prevBtn) prevBtn.disabled = current === 1;

      // 第 8 步：只显示"上一步"和"提交预约"（不显示"下一步"）
      // "提交预约"按钮根据必填项填写情况显示/隐藏
      if (current === total) {
        if (nextBtn) nextBtn.hidden = true;
        if (submitBtn) submitBtn.hidden = false;
      } else {
        if (nextBtn) nextBtn.hidden = false;
        if (submitBtn) submitBtn.hidden = true;
      }
    }

    // 语言切换时刷新进度文案
    window.addEventListener("langchange", function () { updateUI(); });

    // ---------- 选项点击（通用） ----------
    steps.forEach(function (step) {
      const stepNum = Number(step.dataset.step);
      const options = step.querySelectorAll(".quiz__option");
      options.forEach(function (opt) {
        opt.addEventListener("click", function () {
          // Q1 特殊处理
          if (stepNum === 1) {
            options.forEach(function (o) { o.classList.remove("is-selected"); });
            opt.classList.add("is-selected");
            const subOptions = document.getElementById("q1SubOptions");

            if (opt.dataset.q1 === "overseas") {
              // 海外居民：展开国家选择，不自动跳下一步
              if (subOptions) subOptions.hidden = false;
              answers[1] = undefined; // 等选完国家才算完成
              return;
            } else {
              // 中国境内常住：直接完成
              if (subOptions) subOptions.hidden = true;
              answers[1] = opt.textContent.trim();
              // 清空子选项选中状态
              if (subOptions) {
                subOptions.querySelectorAll(".quiz__sub-option").forEach(function (o) {
                  o.classList.remove("is-selected");
                });
              }
              setTimeout(function () {
                if (current < total) { current++; updateUI(); }
              }, 250);
              return;
            }
          }

          // 其他步骤：选中后自动跳下一步
          options.forEach(function (o) { o.classList.remove("is-selected"); });
          opt.classList.add("is-selected");
          answers[stepNum] = opt.textContent.trim();
          setTimeout(function () {
            if (current < total) { current++; updateUI(); }
          }, 250);
        });
      });
    });

    // ---------- Q1 子选项（国家/地区选择） ----------
    if (q1SubOptions) {
      // 下拉选择器
      if (q1CountrySelect) {
        q1CountrySelect.addEventListener("change", function () {
          if (q1CountrySelect.value) {
            answers[1] = "海外他国居民 - " + q1CountrySelect.value;
            // 清除快捷按钮选中状态
            q1SubOptions.querySelectorAll(".quiz__quick-country").forEach(function (o) {
              o.classList.remove("is-selected");
            });
            setTimeout(function () {
              if (current < total) { current++; updateUI(); }
            }, 250);
          }
        });
      }
      // 快捷国家按钮
      q1SubOptions.querySelectorAll(".quiz__quick-country").forEach(function (opt) {
        opt.addEventListener("click", function () {
          q1SubOptions.querySelectorAll(".quiz__quick-country").forEach(function (o) {
            o.classList.remove("is-selected");
          });
          opt.classList.add("is-selected");
          // 同步到下拉选择器
          if (q1CountrySelect) q1CountrySelect.value = opt.textContent.trim();
          answers[1] = "海外他国居民 - " + opt.textContent.trim();
          setTimeout(function () {
            if (current < total) { current++; updateUI(); }
          }, 250);
        });
      });
    }

    // ---------- 上一步 ----------
    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        if (current > 1) { current--; updateUI(); }
      });
    }

    // ---------- 下一步 ----------
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        if (!isStepComplete(current)) {
          showToast(window.__t ? window.__t(current === 1 ? "toast.q1" : "toast.q") : (current === 1 ? "请选择您的国籍或所在地" : "请先选择一个选项"));
          return;
        }
        if (current < total) { current++; updateUI(); }
      });
    }

    // ---------- 提交 ----------
    if (submitBtn) {
      submitBtn.addEventListener("click", function () {
        const nameEl = quiz.querySelector("[name='quiz_name']");
        const phoneEl = quiz.querySelector("[name='quiz_phone']");

        if (!nameEl.value.trim()) {
          nameEl.focus();
          showToast(window.__t ? window.__t("toast.name") : "请填写您的姓名");
          return;
        }

        if (!phoneEl.value.trim()) {
          phoneEl.focus();
          showToast(window.__t ? window.__t("toast.phone") : "请填写手机号");
          return;
        }

        // 保存就诊记录到右下角 AI 机器人
        if (window.__addMedicalRecord) {
          const country = answers[1] ? answers[1].replace("海外他国居民 - ", "").replace("中国境内常住（持有居留许可）", "中国境内常住") : "海外";
          const entry = answers[2] || "免签入境";
          const city = answers[5] || "上海";
          const date = answers[6] || "暂未确定";
          const now = new Date();
          const pad = function (n) { return n < 10 ? "0" + n : "" + n; };
          window.__addMedicalRecord({
            time: now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate()) + " " + pad(now.getHours()) + ":" + pad(now.getMinutes()),
            name: nameEl.value.trim(),
            summary: country + "国籍 · " + entry + " · " + city + " · " + date,
            intent: "",
          });
        }

        // 隐藏整个问卷区，显示中转页
        quiz.style.display = "none";
        if (loadingEl) loadingEl.hidden = false;

        // 中转页文案轮播（两句话交替）
        const loadingLines = loadingEl ? loadingEl.querySelectorAll(".quiz__loading-line") : [];
        let loadingIdx = 0;
        if (loadingLines.length > 0) {
          loadingLines[0].classList.add("is-active");
          const loadingTimer = setInterval(function () {
            loadingLines.forEach(function (l) { l.classList.remove("is-active"); });
            loadingIdx = (loadingIdx + 1) % loadingLines.length;
            loadingLines[loadingIdx].classList.add("is-active");
          }, 2000);
        }

        // 4 秒后切换到 AI 方案页
        setTimeout(function () {
          if (loadingEl) loadingEl.hidden = true;
          if (aiPlanEl) aiPlanEl.hidden = false;
          renderAiPlan();
        }, 4000);
      });
    }

    // ---------- 生成 AI 就诊方案 ----------
    function renderAiPlan() {
      if (!aiPlanBody) return;
      planMode = "aiplan";

      // 读取用户填写的关键信息
      const nameEl = quiz.querySelector("[name='quiz_name']");
      const userName = nameEl ? nameEl.value.trim() : "用户";

      // Q1 国籍/所在地
      const country = answers[1] ? answers[1].replace("海外他国居民 - ", "").replace("中国境内常住（持有居留许可）", "中国境内常住") : "海外";

      // Q2 入境方式
      const entry = answers[2] || "免签入境";

      // Q5  城市
      const city = answers[5] || "上海";

      // Q6 日期
      const date = answers[6] || "暂未确定";

      // 第一轮：完整方案（开场问候 + 合规说明 + 项目清单 + 诊所推荐）
      const _T = function (k, v) { return window.__t ? window.__t(k, v) : ""; };
      aiPlanBody.innerHTML = [
        '<div class="ai-plan__msg">',
        '  <p>' + _T("ap.greet", { name: userName, country: country, entry: entry, city: city, date: date }) + '</p>',
        '</div>',

        '<div class="ai-plan__block">',
        '  <h4>' + _T("ap.complianceTitle") + '</h4>',
        '  <p>' + _T("ap.complianceText", { entry: entry }) + '</p>',
        '</div>',

        '<div class="ai-plan__block">',
        '  <h4>' + _T("ap.projectsTitle") + '</h4>',
        '  <p class="ai-plan__note">' + _T("ap.note") + '</p>',
        '  <div class="ai-plan__group">',
        '    <h5>' + _T("ap.group1Title") + '</h5>',
        '    <ul>',
        '      <li>' + _T("ap.g1_1") + '</li>',
        '      <li>' + _T("ap.g1_2") + '</li>',
        '      <li>' + _T("ap.g1_3") + '</li>',
        '    </ul>',
        '  </div>',
        '  <div class="ai-plan__group">',
        '    <h5>' + _T("ap.group2Title") + '</h5>',
        '    <ul>',
        '      <li>' + _T("ap.g2_1") + '</li>',
        '      <li>' + _T("ap.g2_2") + '</li>',
        '    </ul>',
        '  </div>',
        '  <div class="ai-plan__group">',
        '    <h5>' + _T("ap.group3Title") + '</h5>',
        '    <ul>',
        '      <li>' + _T("ap.g3_1") + '</li>',
        '      <li>' + _T("ap.g3_2") + '</li>',
        '    </ul>',
        '  </div>',
        '</div>',

        '<div class="ai-plan__block">',
        '  <h4>' + _T("ap.clinicTitle") + '</h4>',
        '  <p>' + _T("ap.clinicIntro") + '</p>',
        '  <div class="ai-plan__clinic">',
        '    <strong>' + _T("ap.clinic1Name") + '</strong>',
        '    <p>' + _T("ap.clinic1Addr") + '</p>',
        '    <p>' + _T("ap.clinic1Adv") + '</p>',
        '  </div>',
        '  <div class="ai-plan__clinic">',
        '    <strong>' + _T("ap.clinic2Name") + '</strong>',
        '    <p>' + _T("ap.clinic2Addr") + '</p>',
        '    <p>' + _T("ap.clinic2Adv") + '</p>',
        '  </div>',
        '</div>',

        // 第二轮：追问皮肤问题
        '<div class="ai-plan__block ai-plan__block--question">',
        '  <h4>' + _T("ap.question") + '</h4>',
        '  <div class="ai-plan__options">',
        '    <button type="button" class="ai-plan__option" data-choice="A">' + _T("ap.optA") + '</button>',
        '    <button type="button" class="ai-plan__option" data-choice="B">' + _T("ap.optB") + '</button>',
        '    <button type="button" class="ai-plan__option" data-choice="C">' + _T("ap.optC") + '</button>',
        '    <button type="button" class="ai-plan__option" data-choice="D">' + _T("ap.optD") + '</button>',
        '  </div>',
        '</div>',
      ].join("");

      // 选项点击：显示用户回复 + AI 追问 + 项目/医生
      aiPlanBody.querySelectorAll(".ai-plan__option").forEach(function (btn) {
        btn.addEventListener("click", function () {
          aiPlanBody.querySelectorAll(".ai-plan__option").forEach(function (b) {
            b.classList.remove("is-selected");
            b.disabled = true;
          });
          btn.classList.add("is-selected");
          const choice = btn.dataset.choice;
          const choiceText = btn.textContent;

          // 追加用户消息气泡
          appendMessage("user", choiceText);

          // 0.6s 后 AI 回应
          setTimeout(function () {
            // 移除外层问题卡片（视觉上消失），但保留消息流
            const oldBlock = aiPlanBody.querySelector(".ai-plan__block--question");
            if (oldBlock) oldBlock.remove();

            appendMessage("bot", _T("ap.botChoice", { name: userName }));

            // 渲染项目列表（可勾选）
            appendProjects();

            // 渲染医生列表（可勾选）
            appendDoctors();

            // 最后一句话
            setTimeout(function () {
              appendMessage("bot", _T("ap.botChoice2"));
              if (aiPlanBody) aiPlanBody.scrollTop = aiPlanBody.scrollHeight;
            }, 400);

            if (aiPlanBody) aiPlanBody.scrollTop = aiPlanBody.scrollHeight;
          }, 600);

          if (aiPlanBody) aiPlanBody.scrollTop = aiPlanBody.scrollHeight;
        });
      });
    }

    // 追加消息气泡（一次性显示完整内容，不再使用流式打字效果）
    function appendMessage(role, text) {
      if (!aiPlanBody) return;
      const msg = document.createElement("div");
      msg.className = "ai-plan__msg ai-plan__msg--" + role;
      const para = document.createElement("p");
      msg.appendChild(para);
      aiPlanBody.appendChild(msg);

      // 解析 markdown 加粗和换行后一次性渲染
      const html = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>");
      para.innerHTML = html;
      aiPlanBody.scrollTop = aiPlanBody.scrollHeight;
    }

    // ---------- 选项1：预约流程指引（富内容：按钮 + 就诊信息卡片 + 二维码） ----------
    function renderBookingReply(projects, doctors) {
      if (!aiPlanBody) return;
      planMode = "book";
      lastProjects = projects;
      lastDoctors = doctors;

      // 用户信息
      const nameEl = quiz.querySelector("[name='quiz_name']");
      const userName = nameEl ? nameEl.value.trim() : "用户";

      // 项目、医生、诊所（从勾选数据提取，缺省用示例值）
      const projectName = (projects && projects.length > 0) ? projects[0] : "润致娃娃针";
      const doctorFull = (doctors && doctors.length > 0) ? doctors[0] : "李晓宁 医生｜静安国际诊所";
      const doctorName = doctorFull.split("｜")[0].trim();
      const clinicName = doctorFull.indexOf("｜") > -1 ? doctorFull.split("｜")[1].trim() : "静安国际诊所";

      // 就诊日期（问卷第6步）
      const rawDate = answers[6] || "暂未确定";
      const dateCn = rawDate;
      const dateCompact = rawDate !== "暂未确定" ? rawDate.replace("年", ".").replace("月", ".").replace("日", "") : "待定";

      // 开场气泡
      appendMessage("bot", _T("ap.bookGreet", { project: projectName, doctor: doctorName, clinic: clinicName, date: dateCompact }));

      // 主体富内容气泡（步骤卡片）
      const wrap = document.createElement("div");
      wrap.className = "ai-plan__msg ai-plan__msg--bot ai-plan__rich";
      wrap.innerHTML = [
        // 第一步
        '<div class="ai-plan__section">',
        '  <div class="ai-plan__section-head">',
        '    <span class="ai-plan__section-badge">1</span>',
        '    <span class="ai-plan__section-title">' + _T("ap.bk1Title") + '</span>',
        '  </div>',
        '  <div class="ai-plan__section-body">',
        '    <p>' + _T("ap.bk1p1") + '</p>',
        '    <p>' + _T("ap.bk1p2") + '</p>',
        '    <p>' + _T("ap.bk1p3") + '</p>',
        '    <button type="button" class="ai-plan__book-btn" data-act="register">' + _T("ap.bkRegister") + '</button>',
        '  </div>',
        '</div>',
        // 第二步
        '<div class="ai-plan__section">',
        '  <div class="ai-plan__section-head">',
        '    <span class="ai-plan__section-badge">2</span>',
        '    <span class="ai-plan__section-title">' + _T("ap.bk2Title") + '</span>',
        '  </div>',
        '  <div class="ai-plan__section-body">',
        '    <p>' + _T("ap.bk2p1") + '</p>',
        '    <button type="button" class="ai-plan__book-btn" data-act="download">' + _T("ap.bkDownload") + '</button>',
        '  </div>',
        '</div>',
        // 第三步
        '<div class="ai-plan__section">',
        '  <div class="ai-plan__section-head">',
        '    <span class="ai-plan__section-badge">3</span>',
        '    <span class="ai-plan__section-title">' + _T("ap.bk3Title") + '</span>',
        '  </div>',
        '  <div class="ai-plan__section-body">',
        '    <p>' + _T("ap.bk3p1") + '</p>',
        '    <p>' + _T("ap.bk3p2") + '</p>',
        '    <div class="ai-plan__spec">',
        '      <div class="ai-plan__spec-row"><span class="ai-plan__spec-label">' + _T("ap.bkSpecPatient") + '</span><span class="ai-plan__spec-value">' + userName + '</span></div>',
        '      <div class="ai-plan__spec-row"><span class="ai-plan__spec-label">' + _T("ap.bkSpecClinic") + '</span><span class="ai-plan__spec-value">' + clinicName + '</span></div>',
        '      <div class="ai-plan__spec-row"><span class="ai-plan__spec-label">' + _T("ap.bkSpecDept") + '</span><span class="ai-plan__spec-value">' + _T("ap.bkDeptValue") + '</span></div>',
        '      <div class="ai-plan__spec-row"><span class="ai-plan__spec-label">' + _T("ap.bkSpecDoctor") + '</span><span class="ai-plan__spec-value">' + doctorName + '</span></div>',
        '      <div class="ai-plan__spec-row"><span class="ai-plan__spec-label">' + _T("ap.bkSpecDate") + '</span><span class="ai-plan__spec-value">' + dateCn + '</span></div>',
        '    </div>',
        '  </div>',
        '</div>',
        // 第四步
        '<div class="ai-plan__section">',
        '  <div class="ai-plan__section-head">',
        '    <span class="ai-plan__section-badge">4</span>',
        '    <span class="ai-plan__section-title">' + _T("ap.bk4Title") + '</span>',
        '  </div>',
        '  <div class="ai-plan__section-body">',
        '    <p>' + _T("ap.bk4p1") + '</p>',
        '    <ul class="ai-plan__points">',
        '      <li>' + _T("ap.bk4li1") + '</li>',
        '      <li>' + _T("ap.bk4li2") + '</li>',
        '    </ul>',
        '  </div>',
        '</div>',
        // 第五步
        '<div class="ai-plan__section">',
        '  <div class="ai-plan__section-head">',
        '    <span class="ai-plan__section-badge">5</span>',
        '    <span class="ai-plan__section-title">' + _T("ap.bk5Title") + '</span>',
        '  </div>',
        '  <div class="ai-plan__section-body">',
        '    <p>' + _T("ap.bk5p1", { date: dateCn, clinic: clinicName }) + '</p>',
        '  </div>',
        '</div>',
        '<p>' + _T("ap.bkWechatTip") + '</p>',
        '<div class="ai-plan__contact-card">',
        '  <p>' + _T("ap.bkContactTitle") + '</p>',
        '  <div class="ai-plan__qrcode"></div>',
        '  <p>' + _T("ap.bkEmail") + '</p>',
        '  <p>' + _T("ap.bkHotline") + '</p>',
        '</div>',
        '<p>' + _T("ap.bkThanks") + '</p>'
      ].join("");
      aiPlanBody.appendChild(wrap);

      // 按钮交互
      wrap.querySelectorAll(".ai-plan__book-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
          if (btn.dataset.act === "register") {
            showToast(window.__t ? window.__t("toast.register") : "注册建档功能演示：请使用护照完成实名认证");
          } else {
            showToast(window.__t ? window.__t("toast.download") : "APP下载功能演示：请前往应用商店下载卓正医疗APP");
          }
        });
      });

      // 生成二维码
      const qrEl = wrap.querySelector(".ai-plan__qrcode");
      if (qrEl) {
        if (typeof QRCode !== "undefined") {
          try {
            QRCode.toDataURL("https://weixin.qq.com/zhuozheng", { width: 120, margin: 1 })
              .then(function (url) {
                const img = document.createElement("img");
                img.src = url;
                img.alt = "微信二维码";
                qrEl.appendChild(img);
              })
              .catch(function () {
                qrEl.textContent = "微信二维码（占位）";
              });
          } catch (e) {
            qrEl.textContent = "微信二维码（占位）";
          }
        } else {
          qrEl.textContent = "微信二维码（占位）";
        }
      }

      aiPlanBody.scrollTop = aiPlanBody.scrollHeight;
    }

    // ---------- 选项2：产品 / 公司 / 医生详细介绍（富内容卡片 + 图片） ----------
    function renderLearnReply(projects, doctors) {
      if (!aiPlanBody) return;
      planMode = "learn";
      lastProjects = projects;
      lastDoctors = doctors;

      const projectName = (projects && projects.length > 0) ? projects[0] : "润致娃娃针";
      const doctorFull = (doctors && doctors.length > 0) ? doctors[0] : "李晓宁 医生｜静安国际诊所";
      const doctorName = doctorFull.split("｜")[0].trim();

      // 开场气泡
      appendMessage("bot", _T("ap.lnGreeting", { project: projectName, doctor: doctorName }));

      // 主体富内容气泡
      const wrap = document.createElement("div");
      wrap.className = "ai-plan__msg ai-plan__msg--bot ai-plan__rich";
      wrap.innerHTML = [
        // 一、品牌与公司
        '<div class="ai-plan__section ai-plan__section--accent">',
        '  <div class="ai-plan__section-head">',
        '    <span class="ai-plan__section-badge">1</span>',
        '    <span class="ai-plan__section-title">' + _T("ap.ln1Title") + '</span>',
        '  </div>',
        '  <div class="ai-plan__section-body">',
        '    <p>' + _T("ap.ln1p1") + '</p>',
        '    <div class="ai-plan__media">',
        '      <img src="pic/product.jpg" alt="润致娃娃针产品图" loading="lazy" />',
        '      <div class="ai-plan__media-caption">' + _T("ap.lnCaption") + '</div>',
        '    </div>',
        '  </div>',
        '</div>',
        // 二、产品详情
        '<div class="ai-plan__section">',
        '  <div class="ai-plan__section-head">',
        '    <span class="ai-plan__section-badge">2</span>',
        '    <span class="ai-plan__section-title">' + _T("ap.ln2Title") + '</span>',
        '  </div>',
        '  <div class="ai-plan__section-body">',
        '    <div class="ai-plan__spec">',
        '      <div class="ai-plan__spec-row"><span class="ai-plan__spec-label">' + _T("ap.lnSpec1") + '</span><span class="ai-plan__spec-value">' + _T("ap.lnSpec1v") + '</span></div>',
        '      <div class="ai-plan__spec-row"><span class="ai-plan__spec-label">' + _T("ap.lnSpec2") + '</span><span class="ai-plan__spec-value">' + _T("ap.lnSpec2v") + '</span></div>',
        '      <div class="ai-plan__spec-row"><span class="ai-plan__spec-label">' + _T("ap.lnSpec3") + '</span><span class="ai-plan__spec-value">' + _T("ap.lnSpec3v") + '</span></div>',
        '      <div class="ai-plan__spec-row"><span class="ai-plan__spec-label">' + _T("ap.lnSpec4") + '</span><span class="ai-plan__spec-value">' + _T("ap.lnSpec4v") + '</span></div>',
        '      <div class="ai-plan__spec-row"><span class="ai-plan__spec-label">' + _T("ap.lnSpec5") + '</span><span class="ai-plan__spec-value">' + _T("ap.lnSpec5v") + '</span></div>',
        '      <div class="ai-plan__spec-row"><span class="ai-plan__spec-label">' + _T("ap.lnSpec6") + '</span><span class="ai-plan__spec-value">' + _T("ap.lnSpec6v") + '</span></div>',
        '    </div>',
        '    <div class="ai-plan__highlight">' + _T("ap.lnHighlight") + '</div>',
        '    <ul class="ai-plan__points">',
        '      ' + (_T("ap.lnPoints") || []).map(function (p) { return '<li>' + p + '</li>'; }).join(''),
        '    </ul>',
        '    <div class="ai-plan__spec">',
        '      <div class="ai-plan__spec-row"><span class="ai-plan__spec-label">' + _T("ap.lnSpec7") + '</span><span class="ai-plan__spec-value">' + _T("ap.lnSpec7v") + '</span></div>',
        '      <div class="ai-plan__spec-row"><span class="ai-plan__spec-label">' + _T("ap.lnSpec8") + '</span><span class="ai-plan__spec-value">' + _T("ap.lnSpec8v") + '</span></div>',
        '    </div>',
        '  </div>',
        '</div>',
        // 三、医生介绍
        '<div class="ai-plan__section">',
        '  <div class="ai-plan__section-head">',
        '    <span class="ai-plan__section-badge">3</span>',
        '    <span class="ai-plan__section-title">' + _T("ap.ln3Title") + '</span>',
        '  </div>',
        '  <div class="ai-plan__section-body">',
        '    <p>' + _T("ap.ln3p1", { doctor: doctorName }) + '</p>',
        '    <div class="ai-plan__media">',
        '      <img src="pic/doctor.png" alt="' + doctorName + '医生" loading="lazy" />',
        '      <div class="ai-plan__media-caption">' + _T("ap.lnCaption2", { doctor: doctorName }) + '</div>',
        '    </div>',
        '  </div>',
        '</div>',
        // 四、客观局限
        '<div class="ai-plan__section">',
        '  <div class="ai-plan__section-head">',
        '    <span class="ai-plan__section-badge">4</span>',
        '    <span class="ai-plan__section-title">' + _T("ap.ln4Title") + '</span>',
        '  </div>',
        '  <div class="ai-plan__section-body">',
        '    <p>' + _T("ap.ln4p1") + '</p>',
        '    <p>' + _T("ap.ln4p2") + '</p>',
        '  </div>',
        '</div>',
        // 五、合规与行程影响
        '<div class="ai-plan__section">',
        '  <div class="ai-plan__section-head">',
        '    <span class="ai-plan__section-badge">5</span>',
        '    <span class="ai-plan__section-title">' + _T("ap.ln5Title") + '</span>',
        '  </div>',
        '  <div class="ai-plan__section-body">',
        '    <p>' + _T("ap.ln5p1") + '</p>',
        '  </div>',
        '</div>',
        // 六、档期规则
        '<div class="ai-plan__section">',
        '  <div class="ai-plan__section-head">',
        '    <span class="ai-plan__section-badge">6</span>',
        '    <span class="ai-plan__section-title">' + _T("ap.ln6Title") + '</span>',
        '  </div>',
        '  <div class="ai-plan__section-body">',
        '    <p>' + _T("ap.ln6p1") + '</p>',
        '  </div>',
        '</div>',
        '<p>' + _T("ap.lnEnd") + '</p>'
      ].join("");
      aiPlanBody.appendChild(wrap);
      aiPlanBody.scrollTop = aiPlanBody.scrollHeight;
    }

    // 追加项目卡片（可勾选）
    function appendProjects() {
      if (!aiPlanBody) return;
      const wrap = document.createElement("div");
      wrap.className = "ai-plan__block ai-plan__block--selectable ai-plan__block--projects";
      wrap.innerHTML = [
        '<h4>' + _T("ap.projTitle") + '</h4>',
        '<div class="ai-plan__selectable-list">',
        '  <label class="ai-plan__selectable">',
        '    <input type="checkbox" />',
        '    <span class="ai-plan__selected-tag">✓ 已选</span>',
        '    <div class="ai-plan__selectable-body">',
        '      <div class="ai-plan__selectable-head"><strong>' + _T("ap.proj1Name") + '</strong><span class="ai-plan__selectable-price">' + _T("ap.proj1Price") + '</span></div>',
        '      <p>' + _T("ap.proj1Desc") + '</p>',
        '    </div>',
        '  </label>',
        '  <label class="ai-plan__selectable">',
        '    <input type="checkbox" />',
        '    <span class="ai-plan__selected-tag">✓ 已选</span>',
        '    <div class="ai-plan__selectable-body">',
        '      <div class="ai-plan__selectable-head"><strong>' + _T("ap.proj2Name") + '</strong><span class="ai-plan__selectable-price">' + _T("ap.proj2Price") + '</span></div>',
        '      <p>' + _T("ap.proj2Desc") + '</p>',
        '    </div>',
        '  </label>',
        '  <label class="ai-plan__selectable">',
        '    <input type="checkbox" />',
        '    <span class="ai-plan__selected-tag">✓ 已选</span>',
        '    <div class="ai-plan__selectable-body">',
        '      <div class="ai-plan__selectable-head"><strong>' + _T("ap.proj3Name") + '</strong><span class="ai-plan__selectable-price">' + _T("ap.proj3Price") + '</span></div>',
        '      <p>' + _T("ap.proj3Desc") + '</p>',
        '    </div>',
        '  </label>',
        '</div>',
        '<p class="ai-plan__note">' + _T("ap.noteSel") + '</p>',
      ].join("");
      aiPlanBody.appendChild(wrap);
      aiPlanBody.scrollTop = aiPlanBody.scrollHeight;
    }

    // 追加医生卡片（可勾选）
    function appendDoctors() {
      if (!aiPlanBody) return;
      const wrap = document.createElement("div");
      wrap.className = "ai-plan__block ai-plan__block--selectable ai-plan__block--doctors";
      wrap.innerHTML = [
        '<h4>' + _T("ap.docTitle") + '</h4>',
        '<p class="ai-plan__block-desc">' + _T("ap.docDesc") + '</p>',
        '<div class="ai-plan__selectable-list">',
        '  <label class="ai-plan__selectable">',
        '    <input type="checkbox" />',
        '    <span class="ai-plan__selected-tag">✓ 已选</span>',
        '    <div class="ai-plan__selectable-body">',
        '      <div class="ai-plan__selectable-head"><strong>' + _T("ap.doc1Name") + '</strong></div>',
        '      <p>' + _T("ap.doc1Desc") + '</p>',
        '    </div>',
        '  </label>',
        '  <label class="ai-plan__selectable">',
        '    <input type="checkbox" />',
        '    <span class="ai-plan__selected-tag">✓ 已选</span>',
        '    <div class="ai-plan__selectable-body">',
        '      <div class="ai-plan__selectable-head"><strong>' + _T("ap.doc2Name") + '</strong></div>',
        '      <p>' + _T("ap.doc2Desc") + '</p>',
        '    </div>',
        '  </label>',
        '  <label class="ai-plan__selectable">',
        '    <input type="checkbox" />',
        '    <span class="ai-plan__selected-tag">✓ 已选</span>',
        '    <div class="ai-plan__selectable-body">',
        '      <div class="ai-plan__selectable-head"><strong>' + _T("ap.doc3Name") + '</strong></div>',
        '      <p>' + _T("ap.doc3Desc") + '</p>',
        '    </div>',
        '  </label>',
        '</div>',
      ].join("");
      aiPlanBody.appendChild(wrap);
      aiPlanBody.scrollTop = aiPlanBody.scrollHeight;
    }

    // ---------- 选项3：想再了解下其他项目（先二选一确认方向） ----------
    function renderMoreOptions() {
      if (!aiPlanBody) return;
      planMode = "more";

      appendMessage("bot", _T("ap.moreAsk"));

      const wrap = document.createElement("div");
      wrap.className = "ai-plan__followups";
      wrap.innerHTML = [
        '<button type="button" class="ai-plan__followup" data-action="other-beauty">' + _T("ap.moreBeauty") + '</button>',
        '<button type="button" class="ai-plan__followup" data-action="other-dept">' + _T("ap.moreDept") + '</button>',
      ].join("");
      aiPlanBody.appendChild(wrap);

      wrap.querySelectorAll(".ai-plan__followup").forEach(function (btn) {
        btn.addEventListener("click", function () {
          wrap.querySelectorAll(".ai-plan__followup").forEach(function (b) {
            b.disabled = true;
          });
          btn.classList.add("is-selected");
          appendMessage("user", btn.textContent);
          aiPlanBody.scrollTop = aiPlanBody.scrollHeight;

          setTimeout(function () {
            if (btn.dataset.action === "other-beauty") {
              renderOtherBeauty();
            } else {
              renderOtherDept();
            }
            aiPlanBody.scrollTop = aiPlanBody.scrollHeight;
          }, 500);
        });
      });

      aiPlanBody.scrollTop = aiPlanBody.scrollHeight;
    }

    // 其他医美项目：光电类短时微创/无创项目推荐（复用医生卡片）
    function renderOtherBeauty() {
      if (!aiPlanBody) return;
      appendMessage("bot", _T("ap.beautyBot"));
      appendBeautyProjects();
      appendDoctors();
      setTimeout(function () {
        appendMessage("bot", _T("ap.botChoice2"));
        aiPlanBody.scrollTop = aiPlanBody.scrollHeight;
      }, 400);
    }

    // 光电类医美项目卡片（可勾选）
    function appendBeautyProjects() {
      if (!aiPlanBody) return;
      const wrap = document.createElement("div");
      wrap.className = "ai-plan__block ai-plan__block--selectable ai-plan__block--projects";
      wrap.innerHTML = [
        '<h4>' + _T("ap.beautyTitle") + '</h4>',
        '<div class="ai-plan__selectable-list">',
        '  <label class="ai-plan__selectable">',
        '    <input type="checkbox" />',
        '    <span class="ai-plan__selected-tag">✓ 已选</span>',
        '    <div class="ai-plan__selectable-body">',
        '      <div class="ai-plan__selectable-head"><strong>' + _T("ap.beauty1Name") + '</strong><span class="ai-plan__selectable-price">' + _T("ap.beauty1Price") + '</span></div>',
        '      <p>' + _T("ap.beauty1Desc") + '</p>',
        '    </div>',
        '  </label>',
        '  <label class="ai-plan__selectable">',
        '    <input type="checkbox" />',
        '    <span class="ai-plan__selected-tag">✓ 已选</span>',
        '    <div class="ai-plan__selectable-body">',
        '      <div class="ai-plan__selectable-head"><strong>' + _T("ap.beauty2Name") + '</strong><span class="ai-plan__selectable-price">' + _T("ap.beauty2Price") + '</span></div>',
        '      <p>' + _T("ap.beauty2Desc") + '</p>',
        '    </div>',
        '  </label>',
        '  <label class="ai-plan__selectable">',
        '    <input type="checkbox" />',
        '    <span class="ai-plan__selected-tag">✓ 已选</span>',
        '    <div class="ai-plan__selectable-body">',
        '      <div class="ai-plan__selectable-head"><strong>' + _T("ap.beauty3Name") + '</strong><span class="ai-plan__selectable-price">' + _T("ap.beauty3Price") + '</span></div>',
        '      <p>' + _T("ap.beauty3Desc") + '</p>',
        '    </div>',
        '  </label>',
        '</div>',
        '<p class="ai-plan__note">' + _T("ap.noteSel") + '</p>',
      ].join("");
      aiPlanBody.appendChild(wrap);
      aiPlanBody.scrollTop = aiPlanBody.scrollHeight;
    }

    // 其他科室服务：重新选择 Q4 科室
    function renderOtherDept() {
      if (!aiPlanBody) return;
      appendMessage("bot", _T("ap.deptBot"));

      const depts = _T("ap.depts") || [];

      const wrap = document.createElement("div");
      wrap.className = "ai-plan__followups";
      wrap.innerHTML = depts.map(function (d) {
        return '<button type="button" class="ai-plan__followup">' + d + '</button>';
      }).join("");
      aiPlanBody.appendChild(wrap);

      wrap.querySelectorAll(".ai-plan__followup").forEach(function (btn) {
        btn.addEventListener("click", function () {
          wrap.querySelectorAll(".ai-plan__followup").forEach(function (b) {
            b.disabled = true;
          });
          btn.classList.add("is-selected");
          appendMessage("user", btn.textContent);
          aiPlanBody.scrollTop = aiPlanBody.scrollHeight;

          setTimeout(function () {
            appendMessage("bot", _T("ap.deptRecord", { dept: btn.textContent }));
            aiPlanBody.scrollTop = aiPlanBody.scrollHeight;
          }, 500);
        });
      });

      aiPlanBody.scrollTop = aiPlanBody.scrollHeight;
    }

    // ---------- 勾选状态监听：实时更新"确认选择"按钮 ----------
    let selectedProjects = [];
    let selectedDoctors = [];

    function updateConfirmBtn() {
      if (!aiPlanConfirm) return;
      const checkedBoxes = aiPlanBody.querySelectorAll(".ai-plan__selectable input[type=checkbox]:checked");
      const count = checkedBoxes.length;
      aiPlanConfirm.hidden = count === 0;
      if (count > 0) {
        aiPlanConfirm.textContent = _T("aiplan.confirmCount", { count: count });
      }
      updateSelectedSummary();
      updatePickedText();
    }

    // 在"确认选择"按钮下方实时显示灰色已选摘要
    function updatePickedText() {
      if (!aiPlanPicked) return;
      const checkedProjects = [];
      const checkedDoctors = [];
      aiPlanBody.querySelectorAll(".ai-plan__selectable input[type=checkbox]:checked").forEach(function (cb) {
        const card = cb.closest(".ai-plan__selectable");
        if (!card) return;
        const head = card.querySelector(".ai-plan__selectable-head strong");
        const price = card.querySelector(".ai-plan__selectable-price");
        const name = head ? head.textContent.trim() : "";
        if (!name) return;
        // 有价格的是项目，无价格的是医生
        if (price) {
          checkedProjects.push(name);
        } else {
          checkedDoctors.push(name);
        }
      });

      if (checkedProjects.length === 0 && checkedDoctors.length === 0) {
        aiPlanPicked.hidden = true;
        aiPlanPicked.textContent = "";
        return;
      }

      const parts = [];
      if (checkedProjects.length > 0) {
        parts.push(_T("aiplan.intentProjects") + checkedProjects.join("、"));
      }
      if (checkedDoctors.length > 0) {
        parts.push(_T("aiplan.intentDoctors") + checkedDoctors.join("、"));
      }
      aiPlanPicked.textContent = _T("aiplan.pickedPrefix") + parts.join("，");
      aiPlanPicked.hidden = false;
    }

    // 更新已选汇总条（在 AI 方案页顶部持续可见）
    function updateSelectedSummary() {
      if (!aiPlanBody) return;

      let summary = aiPlanBody.querySelector(".ai-plan__selected-summary");
      if (!summary) {
        // 创建汇总条（插入到 ai-plan-body 顶部）
        summary = document.createElement("div");
        summary.className = "ai-plan__selected-summary";
        aiPlanBody.insertBefore(summary, aiPlanBody.firstChild);
      }

      const checked = aiPlanBody.querySelectorAll(".ai-plan__selectable input[type=checkbox]:checked");
      if (checked.length === 0) {
        summary.classList.remove("is-visible");
        summary.innerHTML = "";
        return;
      }

      summary.classList.add("is-visible");
      let html = "<strong>" + _T("ap.selectedSummary", { count: checked.length }) + "</strong>";
      checked.forEach(function (cb) {
        const card = cb.closest(".ai-plan__selectable");
        const head = card ? card.querySelector(".ai-plan__selectable-head strong") : null;
        if (head) {
          const name = head.textContent.trim();
          const id = "chip-" + name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "");
          html += '<span class="ai-plan__chip" data-card-id="' + id + '">' + name + ' <span class="ai-plan__chip--remove" data-uncheck="' + id + '" title="移除">×</span></span>';
          card.dataset.cardId = id;
        }
      });
      summary.innerHTML = html;

      // 点击汇总条中的 × 时，取消对应的勾选
      summary.querySelectorAll(".ai-plan__chip--remove").forEach(function (x) {
        x.addEventListener("click", function (e) {
          e.stopPropagation();
          const id = this.dataset.uncheck;
          const card = aiPlanBody.querySelector('[data-card-id="' + id + '"]');
          if (card) {
            const cb = card.querySelector("input[type=checkbox]");
            if (cb && !cb.disabled) {
              cb.checked = false;
              updateConfirmBtn();
            }
          }
        });
      });
    }

    // 委托监听所有 checkbox 变化
    if (aiPlanBody) {
      aiPlanBody.addEventListener("change", function (e) {
        if (e.target && e.target.type === "checkbox") {
          updateConfirmBtn();
        }
      });
    }

    // ---------- 确认选择：收集勾选项，作为用户消息吐出 ----------
    if (aiPlanConfirm) {
      aiPlanConfirm.addEventListener("click", function () {
        const checkedProjects = [];
        const checkedDoctors = [];
        aiPlanBody.querySelectorAll(".ai-plan__selectable").forEach(function (card) {
          const cb = card.querySelector("input[type=checkbox]");
          if (cb && cb.checked) {
            const head = card.querySelector(".ai-plan__selectable-head strong");
            const price = card.querySelector(".ai-plan__selectable-price");
            const name = head ? head.textContent : "";
            // 判断是项目还是医生（医生卡片没有 price）
            if (price) {
              checkedProjects.push(name);
            } else {
              checkedDoctors.push(name);
            }
          }
        });

        // 组装用户消息：以"我对……比较感兴趣"形式呈现
        const interests = checkedProjects.concat(checkedDoctors);
        const msgText = _T("ap.interest", { items: interests.join("、") });

        // 更新历史记录的意向字段
        if (window.__updateLastMedicalRecord && interests.length > 0) {
          window.__updateLastMedicalRecord({ intent: _T("ap.interest", { items: interests.join("、") }) });
        }

        // 作为用户消息吐出
        const userMsg = document.createElement("div");
        userMsg.className = "ai-plan__msg ai-plan__msg--user";
        userMsg.textContent = msgText;
        aiPlanBody.appendChild(userMsg);
        aiPlanBody.scrollTop = aiPlanBody.scrollHeight;

        // 隐藏确认按钮，禁用已选卡片（防止重复提交）
        aiPlanConfirm.hidden = true;
        aiPlanBody.querySelectorAll(".ai-plan__selectable input[type=checkbox]").forEach(function (cb) {
          cb.disabled = true;
        });

        // AI 回复 + 三个后续选项
        setTimeout(function () {
          appendMessage("bot", _T("ap.confirmAsk"));

          // 追加三个选项
          const wrap = document.createElement("div");
          wrap.className = "ai-plan__followups";
          wrap.innerHTML = [
            '<button type="button" class="ai-plan__followup" data-action="book">' + _T("ap.followBook") + '</button>',
            '<button type="button" class="ai-plan__followup" data-action="learn">' + _T("ap.followLearn") + '</button>',
            '<button type="button" class="ai-plan__followup" data-action="more">' + _T("ap.followMore") + '</button>',
          ].join("");
          aiPlanBody.appendChild(wrap);

          // 用户消息：选项点击后
          wrap.querySelectorAll(".ai-plan__followup").forEach(function (btn) {
            btn.addEventListener("click", function () {
              wrap.querySelectorAll(".ai-plan__followup").forEach(function (b) {
                b.disabled = true;
              });
              btn.classList.add("is-selected");
              const text = btn.textContent;
              appendMessage("user", text);
              aiPlanBody.scrollTop = aiPlanBody.scrollHeight;

              // AI 回复
              setTimeout(function () {
                if (btn.dataset.action === "book") {
                  renderBookingReply(checkedProjects, checkedDoctors);
                  aiPlanBody.scrollTop = aiPlanBody.scrollHeight;
                  return;
                }
                if (btn.dataset.action === "learn") {
                  renderLearnReply(checkedProjects, checkedDoctors);
                  aiPlanBody.scrollTop = aiPlanBody.scrollHeight;
                  return;
                }
                // 选项3：先确认方向（其他医美项目 / 其他科室服务）
                renderMoreOptions();
                aiPlanBody.scrollTop = aiPlanBody.scrollHeight;
              }, 500);
            });
          });

          aiPlanBody.scrollTop = aiPlanBody.scrollHeight;
        }, 600);
      });
    }

    // ---------- 常驻输入框：发送文字消息 ----------
    function sendAiMessage() {
      if (!aiPlanInput) return;
      const text = aiPlanInput.value.trim();
      if (!text) return;

      // 用户消息
      appendMessage("user", text);
      aiPlanInput.value = "";

      // AI 回复
      setTimeout(function () {
        appendMessage("bot", _T("ap.sendReply"));
        aiPlanBody.scrollTop = aiPlanBody.scrollHeight;
      }, 600);
    }

    if (aiPlanSend) {
      aiPlanSend.addEventListener("click", sendAiMessage);
    }
    if (aiPlanInput) {
      aiPlanInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") sendAiMessage();
      });
    }

    updateUI();

    /* ---------- 日历选择器逻辑 ---------- */
    (function initCalendar() {
      const calGrid = document.getElementById("calGrid");
      const calTitle = document.getElementById("calTitle");
      const calPrev = document.getElementById("calPrev");
      const calNext = document.getElementById("calNext");
      const calUndecided = document.getElementById("calUndecided");

      if (!calGrid) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let viewYear = today.getFullYear();
      let viewMonth = today.getMonth(); // 0-11
      let selectedDate = null;
      // 暴露重置+渲染函数给外层 resetQuiz 使用
      calRender = function () {
        selectedDate = null;
        render();
      };

      const dayKeys = ["day0", "day1", "day2", "day3", "day4", "day5", "day6"];
      const dayNames = dayKeys.map(function (k) {
        return window.__t ? window.__t("calendar." + k) : ["日", "一", "二", "三", "四", "五", "六"][dayKeys.indexOf(k)];
      });

      function fmtDate(d) {
        return d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + d.getDate() + "日";
      }

      function render() {
        if (calTitle) {
          calTitle.textContent = window.__t
            ? window.__t("calendar.month", { year: viewYear, month: viewMonth + 1 })
            : viewYear + " 年 " + (viewMonth + 1) + " 月";
        }

        // 星期行
        let html = "";
        dayNames.forEach(function (n) {
          html += '<div class="quiz__calendar-day-name">' + n + '</div>';
        });

        const firstDay = new Date(viewYear, viewMonth, 1);
        const lastDay = new Date(viewYear, viewMonth + 1, 0);
        const startWeekday = firstDay.getDay(); // 0=周日
        const daysInMonth = lastDay.getDate();

        // 上个月末几天
        const prevLastDay = new Date(viewYear, viewMonth, 0).getDate();
        for (let i = startWeekday - 1; i >= 0; i--) {
          html += '<button type="button" class="quiz__calendar-cell is-other-month is-disabled" disabled>' + (prevLastDay - i) + '</button>';
        }

        // 本月
        for (let d = 1; d <= daysInMonth; d++) {
          const cellDate = new Date(viewYear, viewMonth, d);
          cellDate.setHours(0, 0, 0, 0);
          const isPast = cellDate < today;
          const isToday = cellDate.getTime() === today.getTime();
          const isSelected = selectedDate && cellDate.getTime() === selectedDate.getTime();

          let cls = "quiz__calendar-cell";
          if (isPast) cls += " is-disabled";
          if (isToday) cls += " is-today";
          if (isSelected) cls += " is-selected";
          const disabled = isPast ? "disabled" : "";

          const dateVal = cellDate.getFullYear() + "-" + (cellDate.getMonth() + 1) + "-" + cellDate.getDate();
          html += '<button type="button" class="' + cls + '" data-date="' + dateVal + '" ' + disabled + '>' + d + '</button>';
        }

        // 下个月头几天
        const totalCells = startWeekday + daysInMonth;
        const remainder = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
        for (let i = 1; i <= remainder; i++) {
          html += '<button type="button" class="quiz__calendar-cell is-other-month is-disabled" disabled>' + i + '</button>';
        }

        calGrid.innerHTML = html;

        // 绑定日期点击
        calGrid.querySelectorAll(".quiz__calendar-cell:not(.is-disabled)").forEach(function (cell) {
          cell.addEventListener("click", function () {
            const parts = cell.dataset.date.split("-");
            selectedDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
            answers[6] = fmtDate(selectedDate);
            // 取消"暂未确定"选中状态
            if (calUndecided) calUndecided.classList.remove("is-selected");
            render();
            // 选中后自动进入下一步
            setTimeout(function () {
              if (current === 6 && current < total) {
                current++;
                updateUI();
              }
            }, 250);
          });
        });
      }

      if (calPrev) {
        calPrev.addEventListener("click", function () {
          viewMonth--;
          if (viewMonth < 0) { viewMonth = 11; viewYear--; }
          render();
        });
      }

      if (calNext) {
        calNext.addEventListener("click", function () {
          viewMonth++;
          if (viewMonth > 11) { viewMonth = 0; viewYear++; }
          render();
        });
      }

      if (calUndecided) {
        calUndecided.addEventListener("click", function () {
          selectedDate = null;
          answers[6] = "暂未确定";
          calUndecided.classList.add("is-selected");
          render();
          // 选中后自动进入下一步
          setTimeout(function () {
            if (current === 6 && current < total) {
              current++;
              updateUI();
            }
          }, 250);
        });
      }

      render();

      // 语言切换时刷新日历
      window.addEventListener("langchange", function () { render(); });
    })();
  })();

  /* ---------- 酒店搜索自动匹配 ---------- */
  (function initHotelSearch() {
    const input = document.getElementById("hotelInput");
    const results = document.getElementById("hotelResults");
    if (!input || !results) return;

    // 模拟酒店数据库（常见酒店名称）
    const hotels = [
      "上海外滩华尔道夫酒店",
      "上海和平饭店",
      "上海半岛酒店",
      "上海浦东香格里拉大酒店",
      "上海金茂君悦大酒店",
      "北京王府半岛酒店",
      "北京四季酒店",
      "北京国贸大酒店",
      "广州四季酒店",
      "广州白天鹅宾馆",
      "深圳瑞吉酒店",
      "深圳柏悦酒店",
      "杭州西子湖四季酒店",
      "杭州柏悦酒店",
      "成都华尔道夫酒店",
      "苏州W酒店",
      "南京金陵饭店",
      "武汉光谷凯悦酒店",
      "西安索菲特传奇酒店",
      "希尔顿酒店",
      "万豪酒店",
      "凯悦酒店",
      "香格里拉酒店",
      "洲际酒店",
      "皇冠假日酒店",
      "丽思卡尔顿酒店",
      "文华东方酒店",
      "悦榕庄",
      "威斯汀酒店",
      "喜来登酒店",
    ];

    // 匹配算法：精确匹配优先，包含匹配其次，字符匹配最后
    function matchHotels(query) {
      const q = query.toLowerCase();
      return hotels
        .map(function (h) {
          const name = h.toLowerCase();
          let score = 0;
          if (name === q) {
            score = 100;
          } else if (name.indexOf(q) !== -1) {
            score = 80 - (name.length - q.length);
          } else {
            let matched = 0;
            for (let i = 0; i < q.length; i++) {
              if (name.indexOf(q[i]) !== -1) matched++;
            }
            if (matched === q.length && q.length > 0) score = 50 + matched;
          }
          return { name: h, score: score };
        })
        .filter(function (item) { return item.score > 0; })
        .sort(function (a, b) { return b.score - a.score; })
        .slice(0, 6);
    }

    function renderResults(list) {
      if (!list || list.length === 0) {
        results.hidden = true;
        results.innerHTML = "";
        return;
      }
      let html = "";
      list.forEach(function (item) {
        html += '<button type="button" class="quiz__hotel-item" data-hotel="' + item.name + '">' + item.name + '</button>';
      });
      results.innerHTML = html;
      results.hidden = false;

      results.querySelectorAll(".quiz__hotel-item").forEach(function (btn) {
        btn.addEventListener("click", function () {
          input.value = btn.dataset.hotel;
          results.hidden = true;
          results.innerHTML = "";
        });
      });
    }

    input.addEventListener("input", function () {
      const val = input.value.trim();
      if (val.length === 0) {
        results.hidden = true;
        results.innerHTML = "";
        return;
      }
      renderResults(matchHotels(val));
    });

    // 点击输入框外部关闭结果
    document.addEventListener("click", function (e) {
      if (e.target !== input && !results.contains(e.target)) {
        results.hidden = true;
      }
    });
  })();

  /* ---------- 简易 Toast ---------- */
  function showToast(message) {
    let toast = document.querySelector(".toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      document.body.appendChild(toast);
      // 注入样式
      const style = document.createElement("style");
      style.textContent = `
        .toast {
          position: fixed;
          top: 24px;
          left: 50%;
          transform: translateX(-50%) translateY(-100px);
          background: #fff;
          color: #1a2b2b;
          padding: 14px 24px;
          border-radius: 999px;
          box-shadow: 0 8px 24px rgba(26,43,43,.16);
          font-size: 14px;
          font-weight: 500;
          z-index: 9999;
          transition: transform .35s ease, opacity .35s ease;
          opacity: 0;
          pointer-events: none;
          max-width: 90%;
        }
        .toast.is-show {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
      `;
      document.head.appendChild(style);
    }

    toast.textContent = message;
    toast.classList.add("is-show");

    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () {
      toast.classList.remove("is-show");
    }, 3000);
  }

  /* ---------- 平滑滚动（兼容处理） ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href === "#" || href.length < 2) return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const headerHeight = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 12;

      window.scrollTo({
        top: top,
        behavior: "smooth",
      });
    });
  });

  /* ---------- 监听滚动 ---------- */
  let scrollTimer = null;
  window.addEventListener(
    "scroll",
    function () {
      if (scrollTimer) return;
      scrollTimer = requestAnimationFrame(function () {
        onScroll();
        scrollTimer = null;
      });
    },
    { passive: true }
  );

  // 初始触发一次
  onScroll();

  /* ---------- AI 助手对话浮层 ---------- */
  (function initAIChat() {
    const bubble = document.getElementById("aiBubble");
    const chat = document.getElementById("aiChat");
    const closeBtn = document.getElementById("aiChatClose");
    const input = document.getElementById("aiChatInput");
    const sendBtn = document.getElementById("aiChatSend");
    const body = document.getElementById("aiChatBody");
    const historyEl = document.getElementById("aiChatHistory");

    if (!bubble || !chat) return;

    function open() {
      chat.classList.add("is-open");
      chat.setAttribute("aria-hidden", "false");
      bubble.style.display = "none";
      renderHistory();
      if (input) setTimeout(function () { input.focus(); }, 200);
    }

    function close() {
      chat.classList.remove("is-open");
      chat.setAttribute("aria-hidden", "true");
      bubble.style.display = "";
    }

    // ---------- 就诊历史记录（localStorage 持久化） ----------
    const HISTORY_KEY = "zhuozheng_medical_history";

    function getHistory() {
      try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
      } catch (e) {
        return [];
      }
    }

    function saveHistory(list) {
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
      } catch (e) { /* 忽略存储异常 */ }
    }

    // 供问卷流程调用：保存一条就诊记录
    window.__addMedicalRecord = function (record) {
      const list = getHistory();
      list.unshift({
        time: record.time || "",
        name: record.name || "用户",
        summary: record.summary || "",
        intent: record.intent || "",
      });
      if (list.length > 20) list.length = 20; // 最多保留 20 条
      saveHistory(list);
      renderHistory();
    };

    // 供问卷流程调用：更新最新一条记录（如确认选择后补充意向）
    window.__updateLastMedicalRecord = function (patch) {
      const list = getHistory();
      if (list.length > 0) {
        Object.assign(list[0], patch);
        saveHistory(list);
        renderHistory();
      }
    };

    // 渲染历史记录列表
    function renderHistory() {
      if (!historyEl) return;
      const list = getHistory();
      if (list.length === 0) {
        historyEl.hidden = true;
        historyEl.innerHTML = "";
        return;
      }

      historyEl.hidden = false;
      const cards = list.map(function (r) {
        let html = '<div class="ai-chat__record">';
        html += '<div class="ai-chat__record-head"><strong>' + (window.__t ? window.__t("aiChat.recordTitle") : "就诊记录") + '</strong><span>' + r.time + '</span></div>';
        if (r.name) html += '<p><span class="ai-chat__record-label">' + (window.__t ? window.__t("aiChat.patient") : "就诊人") + '</span>' + r.name + '</p>';
        if (r.summary) html += '<p><span class="ai-chat__record-label">' + (window.__t ? window.__t("aiChat.plan") : "方案") + '</span>' + r.summary + '</p>';
        if (r.intent) html += '<p><span class="ai-chat__record-label">' + (window.__t ? window.__t("aiChat.intent") : "意向") + '</span>' + r.intent + '</p>';
        html += '</div>';
        return html;
      });
      historyEl.innerHTML = '<div class="ai-chat__history-title">' + (window.__t ? window.__t("aiChat.historyRecords") : "历史就诊记录") + '</div>' + cards.join("");
    }

    // 切换语言时，若客服浮层已打开，重渲染历史记录（标签随语言变化）
    document.addEventListener("langchange", function () {
      if (chat && chat.classList.contains("is-open")) {
        renderHistory();
      }
    });

    // 点击 AI 气泡：打开对话浮层（历史记录 + 提问）
    bubble.addEventListener("click", open);

    if (closeBtn) closeBtn.addEventListener("click", close);

    // 简单的回复逻辑（demo）
    const replies = [
      { keywords: ["预约", "挂号", "book"], key: "aichat.r1" },
      { keywords: ["保险", "insurance", "直付"], key: "aichat.r2" },
      { keywords: ["签证", "visa", "入境"], key: "aichat.r3" },
      { keywords: ["语言", "翻译", "english"], key: "aichat.r4" },
      { keywords: ["城市", "哪里", "地址"], key: "aichat.r5" },
      { keywords: ["牙", "齿科", "dental"], key: "aichat.r6" },
      { keywords: ["医美", "美容", "beauty"], key: "aichat.r7" },
      { keywords: ["价格", "费用", "多少钱"], key: "aichat.r8" },
    ];

    function getReply(text) {
      const t = text.toLowerCase();
      for (let i = 0; i < replies.length; i++) {
        if (replies[i].keywords.some(function (k) { return t.indexOf(k) !== -1; })) {
          return window.__t ? window.__t(replies[i].key) : "";
        }
      }
      return window.__t
        ? window.__t("aichat.fallback")
        : "感谢您的提问！关于具体的就诊问题，建议您点击「立即预约」填写问卷，或拨打 24 小时热线 400-888-0000，我们的多语种客服将为您解答。";
    }

    function addMsg(text, type) {
      const msg = document.createElement("div");
      msg.className = "ai-chat__msg ai-chat__msg--" + type;
      msg.textContent = text;
      body.appendChild(msg);
      body.scrollTop = body.scrollHeight;
    }

    function send() {
      const text = input.value.trim();
      if (!text) return;
      addMsg(text, "user");
      input.value = "";
      // 模拟打字延迟
      setTimeout(function () {
        addMsg(getReply(text), "bot");
      }, 600);
    }

    if (sendBtn) sendBtn.addEventListener("click", send);

    // 开始填写：呼起问卷
    const startBtn = document.getElementById("aiChatStartBtn");
    if (startBtn) {
      startBtn.addEventListener("click", function () {
        close();
        if (window.__openQuizModal) window.__openQuizModal();
      });
    }

    if (input) {
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") send();
      });
    }

    // 推荐问题点击
    body.querySelectorAll(".ai-chat__suggestion").forEach(function (btn) {
      btn.addEventListener("click", function () {
        input.value = btn.textContent;
        send();
      });
    });
  })();
})();
