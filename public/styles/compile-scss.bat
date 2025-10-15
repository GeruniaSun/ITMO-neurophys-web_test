@echo off
echo Компиляция SCSS в CSS...
npx sass "%~dp0style_test.scss" "%~dp0style_test.css"
echo Готово! CSS файл обновлен.
pause
