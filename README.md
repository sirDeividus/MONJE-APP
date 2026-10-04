# Monk Mode Progress Tracker

App Android (Expo + React Native + NativeWind) con 6 pilares diarios: Cero Alcohol, Sin Porno/Sin Masturbación, Estudio en PC (Inglés + Ciberseguridad, 45 min), Lectura (40 min), Meditación y Ejercicio, con recordatorios y frases motivacionales. Datos 100% locales (AsyncStorage). Dark mode por defecto.

## Ejecutar en Android Studio

1. Instala Node 18+ y Android Studio (con un emulador AVD creado en *Device Manager*, o un teléfono con depuración USB).
2. Configura `ANDROID_HOME` (Windows: `%LOCALAPPDATA%\Android\Sdk`; Mac/Linux: `~/Android/Sdk`) y agrega `platform-tools` al PATH.
3. En la carpeta del proyecto:
   ```bash
   npm install
   npx expo run:android      # genera /android, compila e instala en el emulador abierto
   ```
   (Alternativa rápida: `npx expo start --android` con Expo Go.)
4. Para abrirlo como proyecto nativo: Android Studio → *Open* → carpeta `android/` (creada por `expo run:android` o `npx expo prebuild -p android`).
5. APK/AAB de release: desde Android Studio, *Build → Generate Signed Bundle / APK*.

## Crear el proyecto desde cero (equivalente)

```bash
npx create-expo-app@latest monk-mode --template blank
cd monk-mode
npx expo install @react-native-async-storage/async-storage react-native-svg react-native-reanimated react-native-safe-area-context nativewind
npm i -D tailwindcss@^3.4.17
```
Luego copia `App.js`, `src/`, `babel.config.js`, `metro.config.js`, `tailwind.config.js`, `global.css`.

## Estructura
- `App.js` – estado global, persistencia (debounce), tabs.
- `src/screens/TodayScreen.js` – dashboard, racha, anillo de progreso, pilares.
- `src/screens/HistoryScreen.js` – calendario mensual, semana, estadísticas, corrección de días.
- `src/utils.js`, `src/storage.js` – lógica de rachas/fechas y AsyncStorage.
