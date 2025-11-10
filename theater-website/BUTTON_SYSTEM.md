# Система кнопок

## Обзор

Создана единая система кнопок для обеспечения визуальной консистентности по всему сайту.

## Использование

### Базовый компонент Button

```jsx
import Button from './components/Button';

// Основная кнопка
<Button variant="primary">Кнопка</Button>

// Кнопка с разными вариантами
<Button variant="secondary">Вторичная</Button>
<Button variant="outline">Контурная</Button>
<Button variant="ghost">Призрачная</Button>

// Размеры
<Button size="sm">Маленькая</Button>
<Button size="md">Средняя</Button>
<Button size="lg">Большая</Button>

// Дополнительные опции
<Button disabled>Отключена</Button>
<Button elevated>С тенью</Button>
```

### Варианты кнопок

| Вариант | Описание | Цвет |
|---------|----------|------|
| `primary` | Основная кнопка | Золотой (#d4a017) |
| `secondary` | Вторичная кнопка | Синий (#0066cc) |
| `outline` | Контурная кнопка | Прозрачная с синей рамкой |
| `ghost` | Призрачная кнопка | Прозрачная с серой рамкой |
| `success` | Успех | Зеленый |
| `info` | Информация | Голубой |
| `warning` | Предупреждение | Желтый |
| `danger` | Опасность | Красный |

### Размеры

| Размер | Padding | Font Size | Min Height |
|--------|---------|-----------|------------|
| `sm` | 8px 16px | 14px | 36px |
| `md` | 12px 24px | 16px | 44px |
| `lg` | 16px 32px | 18px | 52px |

### Обратная совместимость

Старые классы кнопок автоматически применяют новые стили:

- `.buy-ticket-btn` → `btn btn--primary`
- `.news-btn` → `btn btn--primary`
- `.news-button` → `btn btn--primary`
- `.performance-button` → `btn btn--primary`
- `.buy-button` → `btn btn--primary`
- `.view-button` → `btn btn--outline`

## CSS переменные

```css
:root {
  /* Основные цвета */
  --primary: #d4a017;
  --primary-dark: #b78a14;
  --primary-light: #e6b84d;
  --accent: #0066cc;
  --accent-dark: #0052a3;
  --accent-light: #3385d6;
  
  /* Дополнительные цвета */
  --success: #28a745;
  --success-dark: #1e7e34;
  --info: #17a2b8;
  --info-dark: #138496;
  --warning: #ffc107;
  --warning-dark: #e0a800;
  --danger: #dc3545;
  --danger-dark: #c82333;
  
  /* Размеры и эффекты */
  --radius: 8px;
  --radius-sm: 4px;
  --radius-lg: 12px;
  --shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 4px 20px rgba(0, 0, 0, 0.15);
  
  /* Переходы */
  --transition: all 0.3s ease;
  --transition-fast: all 0.2s ease;
}
```

## Рекомендации

1. **Используйте компонент Button** для новых кнопок
2. **Выбирайте подходящий вариант** в зависимости от важности действия
3. **Соблюдайте размеры** - используйте `sm` для второстепенных действий
4. **Тестируйте доступность** - все кнопки имеют минимальную высоту 44px
5. **Используйте `elevated`** для привлечения внимания к важным действиям

## Миграция

Для миграции существующих кнопок:

1. Замените старые классы на компонент Button
2. Выберите подходящий вариант и размер
3. Удалите старые CSS стили (если они больше не нужны)
4. Протестируйте на разных устройствах


