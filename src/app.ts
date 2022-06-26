//#region @notForNpm

// @browserLine
    import { NgModule } from '@angular/core';
// @browserLine
    import { Component, OnInit } from '@angular/core';

//#region @browser
    @Component({
      selector: 'app-isomorphic-region-loader',
      template: 'hello from isomorphic-region-loader'
    })
    export class IsomorphicRegionLoaderComponent implements OnInit {
      constructor() { }

      ngOnInit() { }
    }

    @NgModule({
      imports: [],
      exports: [IsomorphicRegionLoaderComponent],
      declarations: [IsomorphicRegionLoaderComponent],
      providers: [],
    })
    export class IsomorphicRegionLoaderModule { }
    //#endregion

    //#region @backend
    async function start(port: number) {
      console.log('hello world from backend');
    }

    export default start;

//#endregion

//#endregion