/**
 * Typography used in theme
 * @param {JsonObject} theme theme customization object
 */

export default function themeTypography(theme) {
    return {
        fontFamily: theme?.customization?.fontFamily,
        h6: {
            fontWeight: 500,
            color: '#fff',
            fontSize: '0.75rem'
        },
        h5: {
            fontSize: '0.875rem',
            color: '#fff',
            fontWeight: 500
        },
        h4: {
            fontSize: '1rem',
            color: '#fff',
            fontWeight: 600
        },
        h3: {
            fontSize: '1.25rem',
            color: '#fff',
            fontWeight: 600
        },
        h2: {
            fontSize: '1.5rem',
            color: '#fff',
            fontWeight: 700
        },
        h1: {
            fontSize: '2.125rem',
            color: '#fff',
            fontWeight: 700
        },
        subtitle1: {
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#fff'
        },
        subtitle2: {
            fontSize: '0.75rem',
            fontWeight: 400,
            color: '#fff'
        },
        caption: {
            fontSize: '0.75rem',
            color: '#fff',
            fontWeight: 400
        },
        body1: {
            fontSize: '0.875rem',
            fontWeight: 400,
            lineHeight: '1.334em'
        },
        body2: {
            letterSpacing: '0em',
            fontWeight: 400,
            lineHeight: '1.5em',
            color: '#fff'
        },
        button: {
            textTransform: 'capitalize',
            color: '#334155'
        },
        customInput: {
            marginTop: 1,
            marginBottom: 1,
            '& > label': {
                top: 23,
                left: 0,
                color: '#fff',
                '&[data-shrink="false"]': {
                    top: 5
                }
            },
            '& > div > input': {
                padding: '30.5px 14px 11.5px !important'
            },
            '& legend': {
                display: 'none'
            },
            '& fieldset': {
                color: '#fff',
                top: 0
            }
        },
        mainContent: {
            backgroundColor: '#1e293c',
            width: '100%',
            minHeight: 'calc(100vh - 120px)',
            flexGrow: 1,
            padding: '20px',
            marginTop: '88px',
            marginBottom: '40px',
            marginRight: '20px',
            borderRadius: `${theme?.customization?.borderRadius}px`
        },
        menuCaption: {
            fontSize: '0.875rem',
            fontWeight: 500,
            color: theme.heading,
            padding: '6px',
            textTransform: 'capitalize',
            marginTop: '10px'
        },
        subMenuCaption: {
            fontSize: '0.6875rem',
            fontWeight: 500,
            color: theme.darkTextSecondary,
            textTransform: 'capitalize'
        },
        commonAvatar: {
            cursor: 'pointer',
            borderRadius: '8px'
        },
        smallAvatar: {
            width: '22px',
            height: '22px',
            fontSize: '1rem'
        },
        mediumAvatar: {
            width: '34px',
            height: '34px',
            fontSize: '1.2rem'
        },
        largeAvatar: {
            width: '44px',
            height: '44px',
            fontSize: '1.5rem'
        }
    };
}
