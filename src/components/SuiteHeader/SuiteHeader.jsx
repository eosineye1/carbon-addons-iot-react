import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { UserAvatar20, Settings20, Help20 } from '@carbon/icons-react';

import { HeaderContainer, SideNav, Header } from '../../index';
import { SideNavPropTypes } from '../SideNav/SideNav';
import { settings } from '../../constants/Settings';

import SuiteHeaderProfile from './SuiteHeaderProfile/SuiteHeaderProfile';
import SuiteHeaderAppSwitcher from './SuiteHeaderAppSwitcher/SuiteHeaderAppSwitcher';
import SuiteHeaderLogoutModal from './SuiteHeaderLogoutModal/SuiteHeaderLogoutModal';
import SuiteHeaderI18N from './i18n';

export const SuiteHeaderRoutePropTypes = PropTypes.shape({
  profile: PropTypes.string,
  navigator: PropTypes.string,
  admin: PropTypes.string,
  logout: PropTypes.string,
  whatsNew: PropTypes.string,
  gettingStarted: PropTypes.string,
  documentation: PropTypes.string,
  requestEnhancement: PropTypes.string,
  support: PropTypes.string,
  about: PropTypes.string,
});

export const SuiteHeaderApplicationPropTypes = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
  isExternal: PropTypes.bool,
});

export const SuiteHeaderI18NPropTypes = PropTypes.shape({
  help: PropTypes.string,
  profileTitle: PropTypes.string,
  profileManageButton: PropTypes.string,
  profileLogoutButton: PropTypes.string,
  logout: PropTypes.string,
  userIcon: PropTypes.string,
  administrationIcon: PropTypes.string,
  settingsIcon: PropTypes.string,
  profileLogoutModalHeading: PropTypes.string,
  profileLogoutModalSecondaryButton: PropTypes.string,
  profileLogoutModalPrimaryButton: PropTypes.string,
  profileLogoutModalBody: PropTypes.func,
  switcherNavigatorLink: PropTypes.string,
  whatsNew: PropTypes.string,
  documentation: PropTypes.string,
  requestEnhancement: PropTypes.string,
  about: PropTypes.string,
  support: PropTypes.string,
  gettingStarted: PropTypes.string,
});

const defaultProps = {
  className: null,
  appName: null,
  isAdminView: false,
  sideNavProps: null,
  i18n: SuiteHeaderI18N.en,
};

const propTypes = {
  /** Add class name to the rendered Header component */
  className: PropTypes.string,
  /** Name of suite (maps to appName in Header) */
  suiteName: PropTypes.string.isRequired,
  /** Application name in suite (maps to subtitle in Header) */
  appName: PropTypes.string,
  /** Display name of current user */
  userDisplayName: PropTypes.string.isRequired,
  /** Username of current user */
  username: PropTypes.string.isRequired,
  /** If true, renders the admin button in Header as selected */
  isAdminView: PropTypes.bool,
  /** URLs for various routes on Header buttons and submenus */
  routes: SuiteHeaderRoutePropTypes.isRequired,
  /** Applications to render in AppSwitcher */
  applications: PropTypes.arrayOf(SuiteHeaderApplicationPropTypes).isRequired,
  /** side navigation component */
  sideNavProps: PropTypes.shape(SideNavPropTypes),
  /** I18N strings */
  i18n: SuiteHeaderI18NPropTypes,
};

const SuiteHeader = ({
  className,
  suiteName,
  appName,
  userDisplayName,
  username,
  isAdminView,
  routes,
  applications,
  sideNavProps,
  i18n,
  ...otherHeaderProps
}) => {
  const mergedI18N = { ...defaultProps.i18n, ...i18n };
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <>
      <SuiteHeaderLogoutModal
        suiteName={suiteName}
        displayName={userDisplayName}
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onLogout={() => {
          window.location.href = routes.logout;
        }}
        i18n={{
          heading: mergedI18N.profileLogoutModalHeading,
          primaryButton: mergedI18N.profileLogoutModalPrimaryButton,
          secondaryButton: mergedI18N.profileLogoutModalSecondaryButton,
          body: mergedI18N.profileLogoutModalBody,
        }}
      />
      <HeaderContainer
        render={({ isSideNavExpanded, onClickSideNavExpand }) => (
          <>
            <Header
              className={[`${settings.iotPrefix}--suite-header`, className]
                .filter(i => i)
                .join(' ')}
              url={routes.navigator}
              hasSideNav={sideNavProps !== null}
              onClickSideNavExpand={onClickSideNavExpand}
              headerPanel={{
                content: React.forwardRef(() => (
                  <SuiteHeaderAppSwitcher
                    applications={applications}
                    allApplicationsLink={routes.navigator}
                    noAccessLink={routes.gettingStarted}
                    i18n={{
                      allApplicationsLink: mergedI18N.switcherNavigatorLink,
                      requestAccess: mergedI18N.switcherRequestAccess,
                      learnMoreLink: mergedI18N.switcherLearnMoreLink,
                    }}
                  />
                )),
              }}
              appName={suiteName}
              subtitle={appName}
              actionItems={[
                routes.admin !== null
                  ? {
                      label: mergedI18N.administrationIcon,
                      className: ['admin-icon', isAdminView ? 'admin-icon__selected' : null]
                        .filter(i => i)
                        .join(' '),
                      btnContent: (
                        <>
                          <Settings20
                            fill="white"
                            data-testid="admin-icon"
                            description={mergedI18N.settingsIcon}
                          />
                        </>
                      ),
                      onClick: () => {
                        window.location.href = isAdminView
                          ? document.referrer !== ''
                            ? document.referrer
                            : routes.navigator
                          : routes.admin;
                      },
                    }
                  : null,
                {
                  label: mergedI18N.help,
                  onClick: () => {},
                  btnContent: (
                    <Fragment>
                      <Help20 fill="white" description={mergedI18N.help} />
                    </Fragment>
                  ),
                  childContent: [
                    {
                      metaData: {
                        element: 'a',
                        href: routes.whatsNew,
                        title: mergedI18N.whatsNew,
                        target: '_blank',
                      },
                      content: mergedI18N.whatsNew,
                    },
                    {
                      metaData: {
                        element: 'a',
                        href: routes.gettingStarted,
                        title: mergedI18N.gettingStarted,
                        target: '_blank',
                      },
                      content: mergedI18N.gettingStarted,
                    },
                    {
                      metaData: {
                        element: 'a',
                        href: routes.documentation,
                        title: mergedI18N.documentation,
                        target: '_blank',
                      },
                      content: mergedI18N.documentation,
                    },
                    {
                      metaData: {
                        element: 'a',
                        href: routes.requestEnhancement,
                        title: mergedI18N.requestEnhancement,
                        target: '_blank',
                      },
                      content: mergedI18N.requestEnhancement,
                    },
                    {
                      metaData: {
                        element: 'a',
                        href: routes.support,
                        title: mergedI18N.support,
                        target: '_blank',
                      },
                      content: mergedI18N.support,
                    },
                    {
                      metaData: {
                        element: 'a',
                        href: routes.about,
                        title: mergedI18N.about,
                        target: '_self',
                      },
                      content: mergedI18N.about,
                    },
                  ],
                },
                {
                  label: 'user',
                  btnContent: (
                    <Fragment>
                      <UserAvatar20
                        data-testid="user-icon"
                        fill="white"
                        description={mergedI18N.userIcon}
                      />
                    </Fragment>
                  ),
                  childContent: [
                    {
                      metaData: {
                        element: 'div',
                      },
                      content: (
                        <SuiteHeaderProfile
                          displayName={userDisplayName}
                          username={username}
                          profileLink={routes.profile}
                          onRequestLogout={() => setShowLogoutModal(true)}
                          i18n={{
                            profileTitle: mergedI18N.profileTitle,
                            profileButton: mergedI18N.profileManageButton,
                            logoutButton: mergedI18N.profileLogoutButton,
                          }}
                        />
                      ),
                    },
                  ],
                },
              ].filter(i => i)}
              {...otherHeaderProps}
            />
            {sideNavProps ? (
              <SideNav {...sideNavProps} isSideNavExpanded={isSideNavExpanded} />
            ) : null}
          </>
        )}
      />
    </>
  );
};

SuiteHeader.defaultProps = defaultProps;
SuiteHeader.propTypes = propTypes;

export default SuiteHeader;
