/* @flow */

import React, {PureComponent} from 'react';
import {StyleSheet, View} from 'react-native';

import withCachedChildNavigation from '../../withCachedChildNavigation';
import NavigationActions from '../../NavigationActions';

import _ from 'lodash';

import type {
    NavigationScreenProp,
    NavigationRoute,
    NavigationAction,
    NavigationRouter,
    NavigationDrawerScreenOptions,
    NavigationState,
    NavigationStateRoute,
    Style,
} from '../../TypeDefinition';

import type {DrawerScene, DrawerItem} from './DrawerView';

type
Navigation = NavigationScreenProp < NavigationStateRoute, NavigationAction >;

type
Props = {
        router: NavigationRouter <
        NavigationState,
        NavigationAction,
        NavigationDrawerScreenOptions
    >,
    navigation
:
Navigation,
    childNavigationProps
:
{
    [key
:
    string
]:
    Navigation
}
,
contentComponent: ReactClass < * >,
    contentOptions ? : {},
    screenProps ? : {},
    style ? : Style,
}
;

/**
 * Component that renders the sidebar screen of the drawer.
 */
class DrawerSidebar extends PureComponent<void, Props, void> {
    props: Props;

    constructor(props) {
        super(props);

        this.state = {
            fname: null,
            rebate_total: null
        }

        //this.updateDrawerUserInfo = this.updateDrawerUserInfo.bind(this);
    }

    _getScreenOptions = (routeKey: string) => {
        const DrawerScreen = this.props.router.getComponentForRouteName(
            'DrawerClose'
        );
        const {[routeKey]: childNavigation} = this.props.childNavigationProps;
        return DrawerScreen.router.getScreenOptions(
            childNavigation.state.index !== undefined // if the child screen is a StackRouter then always show the screen options of its first screen (see #1914)
                ? {
                    ...childNavigation,
                    state: {...childNavigation.state, index: 0},
                }
                : childNavigation,
            this.props.screenProps
        );
    };

    _getLabel = ({focused, tintColor, route}: DrawerScene) => {
        const {drawerLabel, title} = this._getScreenOptions(route.key);
        if (drawerLabel) {
            return typeof drawerLabel === 'function'
                ? drawerLabel({tintColor, focused})
                : drawerLabel;
        }

        if (typeof title === 'string') {
            return title;
        }

        return route.routeName;
    };

    _renderIcon = ({focused, tintColor, route}: DrawerScene) => {
        const {drawerIcon} = this._getScreenOptions(route.key);
        if (drawerIcon) {
            return typeof drawerIcon === 'function'
                ? drawerIcon({tintColor, focused})
                : drawerIcon;
        }
        return null;
    };

    _onItemPress = ({route, focused}: DrawerItem) => {
        this.props.navigation.navigate('DrawerClose');
        if (!focused) {
            const subAction = route.index !== undefined && route.index !== 0 // if the child screen is a StackRouter then always navigate to its first screen (see #1914)
                ? NavigationActions.navigate({routeName: route.routes[0].routeName})
                : undefined;
            this.props.navigation.navigate(route.routeName, undefined, subAction);
        }
    };

    componentDidMount() {
        //console.log('mounted');
        //this.updateDrawerUserInfo();
        this.props.helperFunctions.updateSidebar = this.updateDrawerUserInfo.bind(this);
    }

    /*componentWillReceiveProps(newProps) {
      console.log('new props');
      console.log(newProps);
      this.updateDrawerUserInfo(newProps);
    }*/

    updateDrawerUserInfo(info) {
        const {
            fName, rebateTotal
        }
            = info;
        //console.log('update drawer');

        let newState = this.state;
        newState.fname = fName;
        newState.rebate_total = rebateTotal;
        this.setState(newState);
        this.forceUpdate();
    }

    render() {
        const ContentComponent = this.props.contentComponent;
        const {state} = this.props.navigation;
        //console.log('drawer sidebar render');
        return (
            <View style={[styles.container, this.props.style]}>
              <ContentComponent
                  {...this.props.contentOptions}
                  navigation={this.props.navigation}
                  items={state.routes}
                  activeItemKey={
                      state.routes[state.index] && state.routes[state.index].key
                  }
                  screenProps={this.props.screenProps}
                  getLabel={this._getLabel}
                  renderIcon={this._renderIcon}
                  onItemPress={this._onItemPress}
                  router={this.props.router}
                  fname={this.state.fname}
                  rebate_total={this.state.rebate_total}
              />
            </View>
        );
    }
}

export default withCachedChildNavigation(DrawerSidebar);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});
