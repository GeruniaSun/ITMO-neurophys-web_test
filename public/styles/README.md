# SCSS структура на гптшканных стилей

## 📁 дерево файлов

```
styles/
├── base/                    # базовые стили
│   └── _base.scss           # сброс, базовые элементы
├── layout/                  # макет и структура
│   ├── _header.scss         # шапка сайта
│   └── _layout.scss         # основные контейнеры и сетка
├── components/              # UI компоненты
│   ├── _components.scss     # кнопки, формы, таблицы
│   ├── _component-okno.scss # компонент окна
│   ├── _side-panel.scss     # боковая панель
│   └── _settings.scss       # настройки
├── utils/                   # утилиты и переменные
│   ├── _variables.scss      # цвета, размеры, шрифты
│   ├── _mixins.scss         # переиспользуемые миксины
│   └── _animations.scss     # анимации и keyframes
├── style_test.scss          # главный файл (импорты)
├── style_test.css           # скомпилированный CSS
└── compile-scss.bat         # скрипт компиляции
```

## 🔧 Использование

после изменений надо запустить `compile-scss.bat` или команду:
   ```bash
   npx sass style_test.scss style_test.css
   ```
- в `test.html` импортируется уже скомпилированный `style_test.css`