// // @ts-nocheck
// //#region imports
// import * as os from 'os'; // @backend

// import { CommonModule } from '@angular/common'; // @browser
// import { NgModule, inject, Injectable } from '@angular/core'; // @browser
// import { Component, OnInit } from '@angular/core'; // @browser
// import { VERSION } from '@angular/core'; // @browser
// import Aura from '@primeng/themes/aura'; // @browser
// import { MaterialCssVarsModule } from 'angular-material-css-vars'; // @browser
// import { RegionRemover } from 'isomorphic-region-loader/src';
// import { providePrimeNG } from 'primeng/config'; // @browser
// import { BehaviorSubject, Observable, map, switchMap } from 'rxjs';
// import { Taon, TaonBaseContext, TAON_CONTEXT, EndpointContext } from 'taon/src';
// import { TAGS, UtilsOs, _ } from 'tnp-core/src';

// import { HOST_CONFIG } from './app.hosts';
// //#endregion

// console.log('hello world');
// console.log('Your backend host ' + HOST_CONFIG['MainContext'].host);
// console.log('Your frontend host ' + HOST_CONFIG['MainContext'].frontendHost);

// //#region isomorphic-region-loader component

// //#region @browser
// @Component({
//   selector: 'app-isomorphic-region-loader',
//   standalone: false,
//   template: `hello from isomorphic-region-loader<br />
//     Angular version: {{ angularVersion }}<br />
//     <br />
//     users from backend
//     <ul>
//       <li *ngFor="let user of users$ | async">{{ user | json }}</li>
//     </ul>
//     hello world from backend: <strong>{{ hello$ | async }}</strong>
//     <br />
//     <button (click)="addUser()">Add new example user with random name</button>`,
//   styles: [
//     `
//       body {
//         margin: 0px !important;
//       }
//     `,
//   ],
// })
// export class IsomorphicRegionLoaderComponent {
//   angularVersion =
//     VERSION.full +
//     ` mode: ${UtilsOs.isRunningInWebSQL() ? ' (websql)' : '(normal)'}`;

//   userApiService = inject(UserApiService);

//   private refresh = new BehaviorSubject<void>(undefined);

//   readonly users$: Observable<User[]> = this.refresh.pipe(
//     switchMap(() =>
//       this.userApiService.userController
//         .getAll()
//         .request()
//         .observable.pipe(map(r => r.body.json)),
//     ),
//   );

//   readonly hello$ = this.userApiService.userController
//     .helloWorld()
//     .request()
//     .observable.pipe(map(r => r.body.text));

//   async addUser(): Promise<void> {
//     const newUser = new User();
//     newUser.name = `user-${Math.floor(Math.random() * 1000)}`;
//     await this.userApiService.userController.save(newUser).request();
//     this.refresh.next();
//   }
// }
// //#endregion

// //#endregion

// //#region  isomorphic-region-loader api service

// //#region @browser
// @Injectable({
//   providedIn: 'root',
// })
// export class UserApiService extends Taon.Base.AngularService {
//   userController = this.injectController(UserController);

//   getAll(): Observable<User[]> {
//     return this.userController
//       .getAll()
//       .request()
//       .observable.pipe(map(r => r.body.json));
//   }
// }
// //#endregion

// //#endregion

// //#region  isomorphic-region-loader module

// //#region @browser
// @NgModule({
//   providers: [
//     {
//       provide: TAON_CONTEXT,
//       useFactory: () => MainContext,
//     },
//     providePrimeNG({
//       // inited ng prime - remove if not needed
//       theme: {
//         preset: Aura,
//       },
//     }),
//   ],
//   exports: [IsomorphicRegionLoaderComponent],
//   imports: [
//     CommonModule,
//     MaterialCssVarsModule.forRoot({
//       // inited angular material - remove if not needed
//       primary: '#4758b8',
//       accent: '#fedfdd',
//     }),
//   ],
//   declarations: [IsomorphicRegionLoaderComponent],
// })
// export class IsomorphicRegionLoaderModule {}
// //#endregion

// //#endregion

// //#region  isomorphic-region-loader entity
// @Taon.Entity({ className: 'User' })
// class User extends Taon.Base.AbstractEntity {
//   //#region @websql
//   @Taon.Orm.Column.String()
//   //#endregion
//   name?: string;

//   getHello(): string {
//     return `hello ${this.name}`;
//   }
// }
// //#endregion

// //#region  isomorphic-region-loader controller
// @Taon.Controller({ className: 'UserController' })
// class UserController extends Taon.Base.CrudController<User> {
//   // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
//   entityClassResolveFn = () => User;

//   @Taon.Http.GET()
//   helloWorld(): Taon.Response<string> {
//     //#region @websqlFunc
//     return async (req, res) => 'hello world';
//     //#endregion
//   }

//   @Taon.Http.GET()
//   getOsPlatform(): Taon.Response<string> {
//     //#region @websqlFunc
//     return async (req, res) => {
//       //#region @backend
//       return os.platform(); // for normal nodejs backend return real value
//       //#endregion

//       return 'no-platform-inside-browser-and-websql-mode';
//     };
//     //#endregion
//   }
// }
// //#endregion

// //#region  isomorphic-region-loader migration

// //#region @websql
// @Taon.Migration({
//   className: 'UserMigration',
// })
// class UserMigration extends Taon.Base.Migration {
//   userController = this.injectRepo(User);

//   async up(): Promise<any> {
//     const superAdmin = new User();
//     superAdmin.name = 'super-admin';
//     await this.userController.save(superAdmin);
//   }
// }
// //#endregion

// //#endregion

// //#region  isomorphic-region-loader context
// var MainContext = Taon.createContext(() => ({
//   ...HOST_CONFIG['MainContext'],
//   contexts: { TaonBaseContext },

//   //#region @websql
//   /**
//    * This is dummy migration - you DO NOT NEED need this migrations object
//    * if you are using HOST_CONFIG['MainContext'] that contains 'migrations' object.
//    * DELETE THIS 'migrations' object if you use taon CLI that generates
//    * migrations automatically inside /src/migrations folder.
//    */
//   migrations: {
//     UserMigration,
//   },
//   //#endregion

//   controllers: {
//     UserController,
//   },
//   entities: {
//     User,
//   },
//   database: true,
//   // disabledRealtime: true,
// }));
// //#endregion

// //#region example code
// var code = () => {
//   const project = { name: 'example-app' };
//   const componentName = `${_.upperFirst(_.camelCase(project.name))}Component`;
//   const moduleName = `${_.upperFirst(_.camelCase(project.name))}Module`;
//   return `${'//#reg' + 'ion'} imports
// import { CommonModule } from '@angular/common'; // @${'bro' + 'wser'}
// import { NgModule, inject, Injectable } from '@angular/core'; // @${'bro' + 'wser'}
// import { Component, OnInit } from '@angular/core'; // @${'bro' + 'wser'}
// import { VERSION } from '@angular/core'; // @${'bro' + 'wser'}
// import { Observable, map } from 'rxjs';
// import { Taon,TaonBaseContext, TAON_CONTEXT } from 'taon/src';
// import { Helpers, UtilsOs } from 'tnp-core/src';

// import {
//   HOST_BACKEND_PORT,
//   CLIENT_DEV_WEBSQL_APP_PORT,
//   CLIENT_DEV_NORMAL_APP_PORT,
// } from './app.hosts';
// ${'//#end' + 'region'}

// console.log('hello world');
// console.log('Your server will start on port '+ HOST_BACKEND_PORT);
// const host = 'http://localhost:' + HOST_BACKEND_PORT;
// const frontendHost =
//   'http://localhost:' +
//   (Helpers.isWebSQL ? CLIENT_DEV_WEBSQL_APP_PORT : CLIENT_DEV_NORMAL_APP_PORT);

// ${'//#reg' + 'ion'} ${project.name} component
// ${'//#reg' + 'ion'} @${'bro' + 'wser'}
// @Component({
//   selector: 'app-${project.name}',
//   'standalone: false',
//   template: \`hello from ${project.name}<br>
//     Angular version: {{ angularVersion }}<br>
//     <br>
//     users from backend
//     <ul>
//       <li *ngFor="let user of (users$ | async)"> {{ user | json }} </li>
//     </ul>
//   \`,
//   styles: [\` body { margin: 0px !important; } \`],
// })
// export class ${componentName} {
//   angularVersion = VERSION.full + \` mode: \${UtilsOs.isRunningInWebSQL() ? ' (websql)' : '(normal)'}\`;
//   userApiService = inject(UserApiService);
//   readonly users$: Observable<User[]> = this.userApiService.getAll();
// }
// ${'//#end' + 'region'}
// ${'//#end' + 'region'}

// ${'//#reg' + 'ion'}  ${project.name} api service
// ${'//#reg' + 'ion'} @${'bro' + 'wser'}
// @Injectable({
//   providedIn:'root'
// })
// export class UserApiService {
//   userController = Taon.inject(()=> MainContext.getClass(UserController))
//   getAll() {
//     return this.userController.getAll()
//       .received
//       .observable
//       .pipe(map(r => r.body.json));
//   }
// }
// ${'//#end' + 'region'}
// ${'//#end' + 'region'}

// ${'//#reg' + 'ion'}  ${project.name} module
// ${'//#reg' + 'ion'} @${'bro' + 'wser'}
// @NgModule({
//   providers: [
//     {
//       provide: TAON_CONTEXT,
//       useValue: MainContext,
//     },
//   ],
//   exports: [${componentName}],
//   imports: [CommonModule],
//   declarations: [${componentName}],
// })
// export class ${moduleName} { }
// ${'//#end' + 'region'}
// ${'//#end' + 'region'}

// ${'//#reg' + 'ion'}  ${project.name} entity
// @Taon.Entity({ className: 'User' })
// class User extends Taon.Base.AbstractEntity {
//   ${'//#reg' + 'ion'} @${'web' + 'sql'}
//   @Taon.Orm.Column.String()
//   ${'//#end' + 'region'}
//   name?: string;
// }
// ${'//#end' + 'region'}

// ${'//#reg' + 'ion'}  ${project.name} controller
// @Taon.Controller({ className: 'UserController' })
// class UserController extends Taon.Base.CrudController<User> {
//   entityClassResolveFn = ()=> User;
//   ${'//#reg' + 'ion'} @${'web' + 'sql'}
//   /**
//    * @deprecated use migrations instead
//    */
//   async initExampleDbData(): Promise<void> {
//     const superAdmin = new User();
//     superAdmin.name = 'super-admin';
//     await this.db.save(superAdmin);
//   }
//   ${'//#end' + 'region'}
// }
// ${'//#end' + 'region'}

// ${'//#reg' + 'ion'}  ${project.name} context
// var MainContext = Taon.createContext(()=>({
//   host,
//   frontendHost,
//   contextName: 'MainContext',
//   contexts:{TaonBaseContext },
//   migrations: {
//     // PUT TAON MIGRATIONS HERE
//   },
//   controllers: {
//     UserController,
//     // PUT TAON CONTROLLERS HERE
//   },
//   entities: {
//     User,
//     // PUT TAON ENTITIES HERE
//   },
//   database: true,
//   // disabledRealtime: true,
// }));
// ${'//#end' + 'region'}

// async function start() {

//   await MainContext.initialize();

//   if (Taon.isBrowser) {
//     const users = (await MainContext.getClassInstance(UserController).getAll().received)
//       .body?.json;
//     console.log({
//       'users from backend': users,
//     });
//   }
// }

// export default start;
//  `;
// };
// //#endregion

// async function start(startParams?: Taon.StartParams): Promise<void> {
//   await MainContext.initialize();

//   //#region @backend
//   if (
//     startParams.onlyMigrationRun ||
//     startParams.onlyMigrationRevertToTimestamp
//   ) {
//     process.exit(0);
//   }
//   //#endregion

//   //#region @backend
//   console.log(`Hello in NodeJs backend! os=${os.platform()}`);
//   //#endregion

//   const taonCode = code();

//   const browserRoot = RegionRemover.from('testpath.ts', taonCode || '', [
//     TAGS.WEBSQL,
//     [TAGS.WEBSQL_FUNC, `return (void 0);`],
//     TAGS.BACKEND,
//     [TAGS.BACKEND_FUNC, `return (void 0);`],
//   ]);
//   const browserCode = browserRoot.output;

//   const backendRoot = RegionRemover.from('testpath.ts', taonCode || '', [
//     TAGS.BROWSER,
//     TAGS.WEBSQL_ONLY,
//   ]);
//   const backendCode = backendRoot.output;

//   const websqlRoot = RegionRemover.from('testpath.ts', taonCode || '', [
//     TAGS.BACKEND,
//     [TAGS.BACKEND_FUNC, `return (void 0);`],
//   ]);
//   const websqlCode = websqlRoot.output;

//   console.log({
//     browserCode,
//     backendCode,
//     websqlCode,
//   });

//   if (UtilsOs.isBrowser) {
//     const users = (
//       await MainContext.getClassInstance(UserController).getAll().request()
//     ).body?.json;
//     for (const user of users || []) {
//       console.log(`user: ${user.name} - ${user.getHello()}`);
//     }
//   }
// }

// export default start;
