** ReadMe DOC for using the DNA MainMenu Component **

** dependencies in use **
eve
snapsvg-cjs
prop-types
classnames

** all props of the component **

1. animationType - (it can be one of slide stack elastic bubble push pushRotate scaleDown scaleRotate fallDown reveal)
pageWrapId - the id of the element wrapping the rest of content on your page
(except elements with fixed positioning),placed after the component
example:
<MainMenu pageWrapId="page-wrap" />
<main id="page-wrap">
.
.
.
</main>

2. outerContainerId - the id of the element containing everything,including the menu component
example:
<div id="outer-container">
<MainMenu pageWrapId="page-wrap" outerContainerId="outer-container" />
<main id="page-wrap">
.
.
.
</main>
</div>

3. right - The menu opens from the left by default.
   To have it open from the right, use the right prop.
   It's just a boolean so you don't need to specify a value.
   Then set the position of the button using CSS.
   example:
   <MainMenu right />

4. width
   You can specify the width of the menu with the width prop. The default is 300.
   <MainMenu width={200} />
   <MainMenu width={'280px'} />
   <MainMenu width={‘20%’} />

5. isOpen
   You can control whether the sidebar is open or closed with the isOpen prop.
   This is useful if you need to close the menu after a user clicks on an item in it,
   for example, or if you want to open the menu from some other button in addition to the standard burger icon.
   The default value is false.
   example:
   <MainMenu isOpen={true} />

6. onOpen
   If you keep the menu state yourself it might be convenient
   to pass a custom function to be used when the user triggers
   something that should open the menu.
   Called when:
   the user clicks on the burger icon
   example:
   <MainMenu onOpen={handleOnOpen} />
   Note: The menu will NOT open automatically
   if you pass this prop,
   so you must handle it yourself.

7. onClose
   If you keep the menu state yourself
   it might be convenient to pass a custom function
   to be used when the user triggers something that
   should close the menu.
   Called when:
   The user clicks on the cross icon
   The user clicks on the overlay
   The user hits the escape key
   <MainMenu onClose={ handleOnClose } />
   Note: The menu will NOT close automatically
   if you pass this prop,
   so you must handle it yourself.

8. onStateChange
   You can detect whether the sidebar is open or
   closed by passing a callback function to
   onStateChange. The callback will receive an object
   containing the new state as its first argument.
   example:
   var isMenuOpen = function(state) {
   return state.isOpen;
   };

<MainMenu onStateChange={ isMenuOpen } />

9. disableCloseOnEsc
   By default, the menu will close when the Escape key
   is pressed. To disable this behavior, you can pass
   the disableCloseOnEsc prop. This is useful in cases
   where you want the menu to be open all the time,
   for example if you're implementing a responsive
   menu that behaves differently depending on the
   browser width.

<MainMenu disableCloseOnEsc />

10. customOnKeyDown
    For more control over global keypress functionality,
    you can override the handler that this component sets
    for window.addEventListener('keydown', handler),
    and pass a custom function. This could be useful
    if you are using multiple instances of this component,
    for example, and want to implement functionality to
    ensure that a single press of the Escape key closes
    them all.
    const closeAllMenusOnEsc = (e) => {
    e = e || window.event;

if (e.key === 'Escape' || e.keyCode === 27) {
this.setState({areMenusOpen: false});
}
};

<MainMenu customOnKeyDown={closeAllMenusOnEsc} isOpen={areMenusOpen} />
Note: Using this prop will disable all the default 
'close on Escape' functionality, so you will need 
to handle this (including determining which key was 
pressed) yourself.

11. noOverlay
    You can turn off the default overlay with noOverlay.
    <MainMenu noOverlay />
    You can disable the overlay click event (i.e. prevent overlay clicks from closing the menu) with disableOverlayClick.
    This can either be a boolean, or a function that returns a boolean.
    <MainMenu disableOverlayClick />
    <MainMenu disableOverlayClick={() => shouldDisableOverlayClick() } />

12. noTransition
    You can disable all transitions/animations by passing
    noTransition.
    <MainMenu noTransition />
    This is useful if you want the menu to remain open
    across re-mounts, for example during SPA route changes.

13. customBurgerIcon
    You can replace the default bars that make up the
    burger and cross icons with custom ReactElements.
    Pass them as the customBurgerIcon and customCrossIcon
    props respectively.
    example:
    <MainMenu customBurgerIcon={ <img src="img/icon.svg" /> } />
    <MainMenu customCrossIcon={ <img src="img/cross.svg" /> } />
    This can be useful if you want exclusive external control
    of the menu, using the isOpen prop.
14. id and className
    There are optional id and className props,
    which will simply add an ID or custom className
    to the rendered menu's outermost element.
    This is not required for any functionality,
    but could be useful for things like styling
    with CSS modules.
    <MainMenu id={ "sidebar" } className={ "my-menu" } />
    You can also pass custom
    classNames to the other elements:
    <MainMenu burgerButtonClassName={ "my-class" } />
    <MainMenu burgerBarClassName={ "my-class" } />
    <MainMenu crossButtonClassName={ "my-class" } />
    <MainMenu crossClassName={ "my-class" } />
    <MainMenu menuClassName={ "my-class" } />
    <MainMenu morphShapeClassName={ "my-class" } />
    <MainMenu itemListClassName={ "my-class" } />
    <MainMenu overlayClassName={ "my-class" } />
    And to the html and body elements (applied when the menu is open):
    <MainMenu htmlClassName={ "my-class" } />
    <MainMenu bodyClassName={ "my-class" } />
    Note: Passing these props will prevent the menu
    from applying styles to the html or body elements
    automatically.

15. disableAutoFocus
    By default, the menu will set focus on the first
    item when opened. This is to help with keyboard
    navigation. If you don't want this functionality,
    you can pass the disableAutoFocus prop.
    <MainMenu disableAutoFocus />

16. itemListElement
    The menu's children are all wrapped in a nav
    element by default, as navigation is likely
    the most common use case for this component.
    However, it's a general purpose sidebar,
    so you can change this to a div if you're
    not using it for navigation:
    <MainMenu itemListElement="div" />

17. styles
    All the animations are handled internally
    by the component. However, the visual styles
    (colors, fonts etc.) are not, and need to be
    supplied, either with CSS or
    with a JavaScript object passed as the styles prop.
    css:
    The component has the following helper classes:
    /_ Position and sizing of burger button _/
    .bm-burger-button {
    position: fixed;
    width: 36px;
    height: 30px;
    left: 36px;
    top: 36px;
    }

/_ Color/shape of burger icon bars _/
.bm-burger-bars {
background: #373a47;
}

/_ Color/shape of burger icon bars on hover_/
.bm-burger-bars-hover {
background: #a90000;
}

/_ Position and sizing of clickable cross button _/
.bm-cross-button {
height: 24px;
width: 24px;
}

/_ Color/shape of close button cross _/
.bm-cross {
background: #bdc3c7;
}

/_
Sidebar wrapper styles
Note: Beware of modifying this element as it can break the animations - you should not need to touch it in most cases
_/
.bm-menu-wrap {
position: fixed;
height: 100%;
}

/_ General sidebar styles _/
.bm-menu {
background: #373a47;
padding: 2.5em 1.5em 0;
font-size: 1.15em;
}

/_ Morph shape necessary with bubble or elastic _/
.bm-morph-shape {
fill: #373a47;
}

/_ Wrapper for item list _/
.bm-item-list {
color: #b8b7ad;
padding: 0.8em;
}

/_ Individual item _/
.bm-item {
display: inline-block;
}

/_ Styling of overlay _/
.bm-overlay {
background: rgba(0, 0, 0, 0.3);
}
javascript:
The same styles can be written as a JavaScript object like this:
var styles = {
bmBurgerButton: {
position: 'fixed',
width: '36px',
height: '30px',
left: '36px',
top: '36px'
},
bmBurgerBars: {
background: '#373a47'
},
bmBurgerBarsHover: {
background: '#a90000'
},
bmCrossButton: {
height: '24px',
width: '24px'
},
bmCross: {
background: '#bdc3c7'
},
bmMenuWrap: {
position: 'fixed',
height: '100%'
},
bmMenu: {
background: '#373a47',
padding: '2.5em 1.5em 0',
fontSize: '1.15em'
},
bmMorphShape: {
fill: '#373a47'
},
bmItemList: {
color: '#b8b7ad',
padding: '0.8em'
},
bmItem: {
display: 'inline-block'
},
bmOverlay: {
background: 'rgba(0, 0, 0, 0.3)'
}
}

<MainMenu styles={ styles } />

** usage **
import {MainMenu} from '../components'

<<<<<<< HEAD:components/MainMenu/mainmenu-readme.md

<div id="outter-container">
 <MainMenu pageWrapId="page-wrap" outterContainerId="outter-container" animationType="slide" right={false} styles={styles}>

# </MainMenu>

# <MainMenu pageWrapId="page-wrap" outterContainerId="outter-container" animationType="slide" right={false} styles={styles}>

<div id="outer-container">
<<<<<<< HEAD:components/MainMenu/readme.txt
 <MainMenu pageWrapId="page-wrap" outterContainerId="outer-container" animationType="slide" right={false} styles={styles}>

# </MainMenu>

 <MainMenu pageWrapId="page-wrap" outterContainerId="outer-container" animationType="slide" right={false} styles={styles}>
>>>>>>> ba20c99:components/MainMenu/mobilemenu-readme.md
        <a id="home" className="menu-item" href="/">Home</a>
        <a id="about" className="menu-item" href="/about">About</a>
        <a id="contact" className="menu-item" href="/contact">Contact</a>
        <a onClick={ this.showSettings } className="menu-item--small" href="">Settings</a>
</MainMenu>
<<<<<<< HEAD:components/MainMenu/mainmenu-readme.md
=======
>>>>>>> @aaron.smulktis/develop:components/MainMenu/Mainmenu-readme.md
>>>>>>> ba20c99:components/MainMenu/mobilemenu-readme.md
<main id="page-wrap">
.
.
.
</main>
</div>

18.pcWrapClassName
19.pcMenuItemClassName
20.onMenuItemClick:(keyPath:string,key:string)=>void;
menusData: [{pcIcon:()=><AccountBalanceOutlinedIcon style={{marginRight:'10px'}} />，icon:()=><AccountBalanceOutlinedIcon style={{marginRight:'10px'}} />，name:'home',key:'home',children:[{name:'home-sub',key:'home-sub'}]}]
