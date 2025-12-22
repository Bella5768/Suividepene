@echo off
echo ========================================
echo   Configuration Email Outlook
echo ========================================
echo.

if exist .env (
    echo Le fichier .env existe deja.
    echo Voulez-vous le remplacer ? (O/N)
    set /p REPONSE=
    if /i not "%REPONSE%"=="O" (
        echo Configuration annulee.
        pause
        exit /b
    )
)

echo.
echo Veuillez entrer vos informations Outlook :
echo.

set /p EMAIL_USER="Adresse email Outlook (ex: contact@outlook.com): "
set /p EMAIL_PASS="Mot de passe Outlook: "

echo.
echo Creation du fichier .env...

(
echo # Configuration Email - Outlook/Office 365
echo EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
echo EMAIL_HOST=smtp.office365.com
echo EMAIL_PORT=587
echo EMAIL_USE_TLS=True
echo EMAIL_USE_SSL=False
echo EMAIL_HOST_USER=%EMAIL_USER%
echo EMAIL_HOST_PASSWORD=%EMAIL_PASS%
echo DEFAULT_FROM_EMAIL=%EMAIL_USER%
echo SERVER_EMAIL=%EMAIL_USER%
) > .env

echo.
echo ========================================
echo   Configuration terminee !
echo ========================================
echo.
echo Le fichier .env a ete cree avec vos informations.
echo.
echo IMPORTANT: Si vous avez l'authentification a deux facteurs (2FA),
echo vous devez utiliser un mot de passe d'application au lieu de votre
echo mot de passe normal. Consultez CONFIGURATION_EMAIL_OUTLOOK.md
echo.
pause


