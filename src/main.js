const header = document.querySelector("[data-header]")
const navToggle = document.querySelector("[data-nav-toggle]")
const mobileNav = document.querySelector("[data-mobile-nav]")
const form = document.querySelector("[data-order-form]")
const statusEl = document.querySelector("[data-form-status]")
const modelSelect = document.querySelector("#model")

function setHeaderState() {
  if (!header) return
  header.classList.toggle("is-scrolled", window.scrollY > 24)
}

function closeMobileNav() {
  if (!navToggle || !mobileNav) return
  navToggle.setAttribute("aria-expanded", "false")
  mobileNav.hidden = true
}

navToggle?.addEventListener("click", () => {
  const open = navToggle.getAttribute("aria-expanded") === "true"
  navToggle.setAttribute("aria-expanded", String(!open))
  mobileNav.hidden = open
})

mobileNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMobileNav)
})

window.addEventListener("scroll", setHeaderState, { passive: true })
setHeaderState()

document.querySelectorAll("[data-model]").forEach((el) => {
  el.addEventListener("click", () => {
    const model = el.getAttribute("data-model")
    if (!modelSelect || !model) return
    const option = [...modelSelect.options].find((item) => item.value === model || item.textContent === model)
    if (option) modelSelect.value = option.value || option.textContent
  })
})

const revealItems = document.querySelectorAll("[data-reveal]")
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add("is-visible")
        observer.unobserve(entry.target)
      })
    },
    { threshold: 0.14, rootMargin: "0px 0px -8% 0px" },
  )
  revealItems.forEach((item) => observer.observe(item))
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"))
}

function sanitize(value) {
  return String(value ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim()
}

function buildVkMessage({ name, phone, city, model, message }) {
  const lines = [
    "Здравствуйте! Заявка с сайта Мебель Азали.",
    `Имя: ${name}`,
    `Телефон: ${phone}`,
  ]
  if (city) lines.push(`Город: ${city}`)
  if (model) lines.push(`Модель: ${model}`)
  if (message) lines.push(`Комментарий: ${message}`)
  return lines.join("\n")
}

form?.addEventListener("submit", (event) => {
  event.preventDefault()
  statusEl.textContent = ""
  statusEl.classList.remove("is-error")

  const data = new FormData(form)
  const payload = {
    name: sanitize(data.get("name")),
    phone: sanitize(data.get("phone")),
    city: sanitize(data.get("city")),
    model: sanitize(data.get("model")),
    message: sanitize(data.get("message")),
  }

  if (!payload.name || !payload.phone) {
    statusEl.textContent = "Укажите имя и телефон."
    statusEl.classList.add("is-error")
    return
  }

  if (payload.phone.replace(/\D/g, "").length < 10) {
    statusEl.textContent = "Проверьте номер телефона."
    statusEl.classList.add("is-error")
    return
  }

  const text = buildVkMessage(payload)

  try {
    void navigator.clipboard?.writeText(text)
  } catch {
    // Clipboard may be unavailable; form still opens VK
  }

  window.open("https://vk.ru/mebelazali", "_blank", "noopener,noreferrer")
  statusEl.textContent =
    "Открыли ВКонтакте. Текст заявки скопирован — вставьте его в сообщение."
  form.reset()
})
