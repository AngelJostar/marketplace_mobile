# Plaza Mayoreo — aplicación móvil

Aplicación universal en Expo/React Native conectada al backend Laravel de Plaza Mayoreo Circunvalación.

## Áreas disponibles

- Catálogo público sin inicio de sesión: portada, búsqueda, tarjetas y detalle de producto.
- Contacto con el vendedor mediante WhatsApp.
- Administración autenticada mediante Laravel Sanctum.
- Consulta y alta de productos.
- Consulta de categorías.
- Base preparada para vendedores, inventarios, banners, ofertas y configuración.

## Configuración local

1. Copia `.env.example` como `.env`.
2. En navegador o simulador iOS puedes usar `http://127.0.0.1:8000/api/v1`.
3. En el emulador Android usa `http://10.0.2.2:8000/api/v1`.
4. En un teléfono físico usa la IP local de la computadora, por ejemplo `http://192.168.1.20:8000/api/v1`, y levanta Laravel escuchando en la red local.

Variables:

```env
EXPO_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
EXPO_PUBLIC_WHATSAPP_NUMBER=525510003000
```

## Ejecución

Primero inicia Laravel. Después, desde esta carpeta:

```bash
npm install
npm start
```

En la consola de Expo presiona `w` para navegador o escanea el código QR con Expo Go.

## Validación

```bash
npx tsc --noEmit
npm run lint
```

## Referencia del proyecto Expo

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
