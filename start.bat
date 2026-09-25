@echo off
title Sistema Grupo Sempre
color 0A

echo ==============================================
echo   INICIANDO O SISTEMA - GRUPO SEMPRE
echo ==============================================
echo.
echo [1/2] Iniciando Servidor Backend (API)...
cd backend
start /B node index.js

timeout /t 2 /nobreak > NUL

echo [2/2] Iniciando Painel Web...
cd ../frontend
echo.
echo ==============================================
echo SISTEMA ONLINE!
echo Deixe esta janela aberta.
echo Outros computadores na rede podem acessar pelo seu IP Local (ex: http://192.168.X.X:5173)
echo ==============================================
echo.
npm run dev
