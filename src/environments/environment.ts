// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  
// local Ganache Member Contract Address --> 0x95eC298f1D21ae5E2ffEcf3bf91674B7179d4353

  membersContractAddress: '0x345cA3e014Aaf5dcA488057592ee47305D9B3e10',
  blockExplorerBaseUrl: 'http://localhost:4200/fakexplorer/'
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
