module.exports = {
  collectCoverageFrom: [
    'src/components/**/*.js?(x)',
    '!src/**/*.story.js?(x)',
    '!src/**/hooks/*.js',
    '!src/components/SuiteHeader/util/suiteHeaderData.js',
  ],
  coveragePathIgnorePatterns: ['/node_modules/', '/lib/', '/coverage/'],
  coverageReporters: ['html', 'text-summary', 'lcov'],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
    './src/components/**/!(ColumnHeaderSelect|WizardInline|WizardHeader|FilterHeaderRow|TableToolbar|RowActionsCell|RowActionsError|TableHead|StatefulTable|StatefulTableDetailWizard|CatalogContent|FileDrop|Dashboard|CardRenderer|ImageHotspots|PageHero|PageTitle|EditPage|AsyncTable|ImageCard|ImageUploader|TableHead|ColumnResize|ColorDropdown|BarChartCard|DashboardGrid|DashboardEditor).jsx': {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
    // TODO: remove in next release
    './src/components/WizardInline/WizardInline.jsx': {
      branches: 70,
    },
    './src/components/WizardInline//WizardHeader/WizardHeader.jsx': {
      branches: 75,
    },
    './src/components/Dashboard/DashboardGrid.jsx': {
      statements: 72,
      branches: 60,
      lines: 71,
    },
    './src/components/DashboardEditor/DashboardEditor.jsx': { branches: 65, functions: 71 },
    './src/components/BarChartCard/BarChartCard.jsx': {
      // TODO: Add tests for tooltip interaction and formatting when below issue is solved
      // https://github.com/carbon-design-system/carbon-charts/issues/594
      functions: 69,
    },
    './src/components/Table/TableHead/TableHeader.js': {
      statements: 60,
      branches: 50,
      lines: 60,
      functions: 33,
    },
    './src/components/Table/TableHead/ColumnResize.jsx': {
      branches: 71,
    },
    './src/components/Table/TableHead/FilterHeaderRow/FilterHeaderRow.jsx': {
      branches: 70,
    },
    './src/components/Table/TableToolbar/TableToolbar.jsx': { functions: 66 },
    './src/components/Table/TableBody/RowActionsCell/RowActionsCell.jsx': {
      statements: 79,
      branches: 70,
      lines: 78,
      functions: 75,
    },
    './src/components/Table/TableBody/RowActionsCell/RowActionsError.jsx': {
      functions: 66,
    },
    './src/components/Table/StatefulTable.jsx': { branches: 66 },
    './src/components/TileCatalog/CatalogContent.jsx': { branches: 50 },
    './src/components/FileDrop/FileDrop.jsx': { branches: 53, functions: 75 },
    './src/components/Dashboard/Dashboard.jsx': {
      statements: 79,
      branches: 50,
      lines: 78,
    },
    './src/components/Dashboard/CardRenderer.jsx': {
      statements: 51,
      branches: 38,
      lines: 51,
      functions: 66,
    },
    './src/components/ImageCard/ImageHotspots.jsx': {
      branches: 79,
    },
    './src/components/ImageCard/ImageUploader.jsx': {
      statements: 46,
      branches: 35,
      lines: 47,
      functions: 26,
    },
    './src/components/Page/EditPage.jsx': {
      statements: 63,
      branches: 50,
      lines: 63,
      functions: 50,
    },
    './src/components/Table/AsyncTable/AsyncTable.jsx': {
      statements: 56,
      branches: 50,
      lines: 57,
      functions: 13,
    },
    './src/components/Table/TableHead/ColumnHeaderSelect/ColumnHeaderSelect.jsx': {
      branches: 75,
    },
    './src/components/Page/PageHero.jsx': { branches: 77 },
    './src/components/Page/PageTitle.jsx': { branches: 75 },
    './src/components/ImageCard/ImageCard.jsx': { branches: 71 },
    './src/components/Table/TableDetailWizard/StatefulTableDetailWizard.jsx': {
      branches: 76,
    },
    './src/components/ColorDropdown/ColorDropdown.jsx': { branches: 75 },
  },
  globals: {
    __DEV__: false,
  },
  setupFiles: ['<rootDir>/config/jest/setup.js'],
  testEnvironment: 'jest-environment-jsdom-sixteen',
  setupFilesAfterEnv: ['<rootDir>/config/jest/setupTest.js'],
  testMatch: [
    '<rootDir>/**/__tests__/**/*.js?(x)',
    '<rootDir>/**/?(*.)(spec|test).js?(x)',
    '<rootDir>/**/?(*.)test.a11y.js?(x)',
  ],
  testURL: 'http://localhost',
  transform: {
    '^.+\\.story\\.jsx?$': '@storybook/addon-storyshots/injectFileName',
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.s?css$': '<rootDir>/config/jest/cssTransform.js',
    '^(?!.*\\.(js|jsx|css|json)$)': '<rootDir>/config/jest/fileTransform.js',
  },
  testPathIgnorePatterns: ['/config/', '/lib/'],
  transformIgnorePatterns: ['/node_modules/(?!(@carbon/charts)).+(.jsx?)', '/__mocks__/.+(.jsx?)'],
  watchPathIgnorePatterns: ['/coverage/', '/results/', '/.git/'],
  moduleFileExtensions: ['js', 'json', 'jsx'],
  snapshotSerializers: ['enzyme-to-json/serializer'],
  moduleNameMapper: {
    // rewrite carbon-components(-react) es imports to lib/cjs imports because jest doesn't support es modules
    '@carbon/icons-react/es/(.*)': '@carbon/icons-react/lib/$1',
    'carbon-components-react/es/(.*)': 'carbon-components-react/lib/$1',
  },
};
