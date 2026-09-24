@echo off
echo Iniciando o Servidor Backend...
start cmd /k "cd backend && node index.js"

echo Iniciando o Frontend React...
start cmd /k "cd frontend && npm run dev"

echo O sistema estara disponivel em breve!
