const Ziggy = {
    url: 'http:\/\/localhost',
    port: null,
    defaults: {},
    routes: {
        login: { uri: 'login', methods: ['GET', 'HEAD'] },
        'login.store': { uri: 'login', methods: ['POST'] },
        logout: { uri: 'logout', methods: ['POST'] },
        'password.request': {
            uri: 'forgot-password',
            methods: ['GET', 'HEAD'],
        },
        'password.reset': {
            uri: 'reset-password\/{token}',
            methods: ['GET', 'HEAD'],
            parameters: ['token'],
        },
        'password.email': { uri: 'forgot-password', methods: ['POST'] },
        'password.update': { uri: 'reset-password', methods: ['POST'] },
        register: { uri: 'register', methods: ['GET', 'HEAD'] },
        'register.store': { uri: 'register', methods: ['POST'] },
        'verification.notice': {
            uri: 'email\/verify',
            methods: ['GET', 'HEAD'],
        },
        'verification.verify': {
            uri: 'email\/verify\/{id}\/{hash}',
            methods: ['GET', 'HEAD'],
            parameters: ['id', 'hash'],
        },
        'verification.send': {
            uri: 'email\/verification-notification',
            methods: ['POST'],
        },
        'password.confirm': {
            uri: 'user\/confirm-password',
            methods: ['GET', 'HEAD'],
        },
        'password.confirmation': {
            uri: 'user\/confirmed-password-status',
            methods: ['GET', 'HEAD'],
        },
        'password.confirm.store': {
            uri: 'user\/confirm-password',
            methods: ['POST'],
        },
        'two-factor.login': {
            uri: 'two-factor-challenge',
            methods: ['GET', 'HEAD'],
        },
        'two-factor.login.store': {
            uri: 'two-factor-challenge',
            methods: ['POST'],
        },
        'two-factor.enable': {
            uri: 'user\/two-factor-authentication',
            methods: ['POST'],
        },
        'two-factor.confirm': {
            uri: 'user\/confirmed-two-factor-authentication',
            methods: ['POST'],
        },
        'two-factor.disable': {
            uri: 'user\/two-factor-authentication',
            methods: ['DELETE'],
        },
        'two-factor.qr-code': {
            uri: 'user\/two-factor-qr-code',
            methods: ['GET', 'HEAD'],
        },
        'two-factor.secret-key': {
            uri: 'user\/two-factor-secret-key',
            methods: ['GET', 'HEAD'],
        },
        'two-factor.recovery-codes': {
            uri: 'user\/two-factor-recovery-codes',
            methods: ['GET', 'HEAD'],
        },
        'two-factor.regenerate-recovery-codes': {
            uri: 'user\/two-factor-recovery-codes',
            methods: ['POST'],
        },
        home: { uri: '\/', methods: ['GET', 'HEAD'] },
        dashboard: { uri: 'dashboard', methods: ['GET', 'HEAD'] },
        'profile.edit': { uri: 'settings\/profile', methods: ['GET', 'HEAD'] },
        'profile.update': { uri: 'settings\/profile', methods: ['PATCH'] },
        'profile.destroy': { uri: 'settings\/profile', methods: ['DELETE'] },
        'user-password.edit': {
            uri: 'settings\/password',
            methods: ['GET', 'HEAD'],
        },
        'user-password.update': { uri: 'settings\/password', methods: ['PUT'] },
        'appearance.edit': {
            uri: 'settings\/appearance',
            methods: ['GET', 'HEAD'],
        },
        'two-factor.show': {
            uri: 'settings\/two-factor',
            methods: ['GET', 'HEAD'],
        },
        'blogs.index': { uri: 'blogs', methods: ['GET', 'HEAD'] },
        'blogs.show': {
            uri: 'blogs\/blogs\/{blog}',
            methods: ['GET', 'HEAD'],
            parameters: ['blog'],
            bindings: { blog: 'slug' },
        },
        'blogs.create': { uri: 'blogs\/create', methods: ['GET', 'HEAD'] },
        'blogs.store': { uri: 'blogs', methods: ['POST'] },
        'blogs.edit': {
            uri: 'blogs\/{blog}\/edit',
            methods: ['GET', 'HEAD'],
            parameters: ['blog'],
            bindings: { blog: 'id' },
        },
        'blogs.update': {
            uri: 'blogs\/{blog}',
            methods: ['PUT', 'PATCH'],
            parameters: ['blog'],
            bindings: { blog: 'id' },
        },
        'blogs.destroy': {
            uri: 'blogs\/{blog}',
            methods: ['DELETE'],
            parameters: ['blog'],
            bindings: { blog: 'id' },
        },
        'blogs.restore': {
            uri: 'blogs\/{id}\/restore',
            methods: ['POST'],
            parameters: ['id'],
        },
        'blogs.trash': { uri: 'blogs\/trash', methods: ['GET', 'HEAD'] },
        'blogs.forceDelete': {
            uri: 'blogs\/{id}\/force-delete',
            methods: ['DELETE'],
            parameters: ['id'],
        },
        'contact-types.index': {
            uri: 'contact-types',
            methods: ['GET', 'HEAD'],
        },
        'contact-types.create': {
            uri: 'contact-types\/create',
            methods: ['GET', 'HEAD'],
        },
        'contact-types.store': { uri: 'contact-types', methods: ['POST'] },
        'contact-types.edit': {
            uri: 'contact-types\/{contact_type}\/edit',
            methods: ['GET', 'HEAD'],
            parameters: ['contact_type'],
        },
        'contact-types.update': {
            uri: 'contact-types\/{contact_type}',
            methods: ['PUT', 'PATCH'],
            parameters: ['contact_type'],
        },
        'contact-types.destroy': {
            uri: 'contact-types\/{contact_type}',
            methods: ['DELETE'],
            parameters: ['contact_type'],
        },
        'contact-types.trash': {
            uri: 'contact-types\/trash',
            methods: ['GET', 'HEAD'],
        },
        'contact-types.restore': {
            uri: 'contact-types\/{id}\/restore',
            methods: ['POST'],
            parameters: ['id'],
        },
        'contact-types.forceDelete': {
            uri: 'contact-types\/{id}\/force',
            methods: ['DELETE'],
            parameters: ['id'],
        },
        'contacts.index': { uri: 'contacts', methods: ['GET', 'HEAD'] },
        'contacts.create': {
            uri: 'contacts\/create',
            methods: ['GET', 'HEAD'],
        },
        'contacts.store': { uri: 'contacts', methods: ['POST'] },
        'contacts.show': {
            uri: 'contacts\/{contact}',
            methods: ['GET', 'HEAD'],
            parameters: ['contact'],
            bindings: { contact: 'id' },
        },
        'contacts.edit': {
            uri: 'contacts\/{contact}\/edit',
            methods: ['GET', 'HEAD'],
            parameters: ['contact'],
            bindings: { contact: 'id' },
        },
        'contacts.update': {
            uri: 'contacts\/{contact}',
            methods: ['PUT', 'PATCH'],
            parameters: ['contact'],
            bindings: { contact: 'id' },
        },
        'contacts.destroy': {
            uri: 'contacts\/{contact}',
            methods: ['DELETE'],
            parameters: ['contact'],
            bindings: { contact: 'id' },
        },
        'contacts.trash': { uri: 'contacts\/trash', methods: ['GET', 'HEAD'] },
        'contacts.restore': {
            uri: 'contacts\/{id}\/restore',
            methods: ['POST'],
            parameters: ['id'],
        },
        'contacts.forceDelete': {
            uri: 'contacts\/{id}\/force',
            methods: ['DELETE'],
            parameters: ['id'],
        },
        'service_inwards.index': {
            uri: 'service_inwards',
            methods: ['GET', 'HEAD'],
        },
        'service_inwards.create': {
            uri: 'service_inwards\/create',
            methods: ['GET', 'HEAD'],
        },
        'service_inwards.store': { uri: 'service_inwards', methods: ['POST'] },
        'service_inwards.show': {
            uri: 'service_inwards\/{service_inward}',
            methods: ['GET', 'HEAD'],
            parameters: ['service_inward'],
        },
        'service_inwards.edit': {
            uri: 'service_inwards\/{service_inward}\/edit',
            methods: ['GET', 'HEAD'],
            parameters: ['service_inward'],
        },
        'service_inwards.update': {
            uri: 'service_inwards\/{service_inward}',
            methods: ['PUT', 'PATCH'],
            parameters: ['service_inward'],
        },
        'service_inwards.destroy': {
            uri: 'service_inwards\/{service_inward}',
            methods: ['DELETE'],
            parameters: ['service_inward'],
        },
        'service_inwards.trash': {
            uri: 'service_inwards\/trash',
            methods: ['GET', 'HEAD'],
        },
        'service_inwards.restore': {
            uri: 'service_inwards\/{id}\/restore',
            methods: ['POST'],
            parameters: ['id'],
        },
        'service_inwards.forceDelete': {
            uri: 'service_inwards\/{id}\/force',
            methods: ['DELETE'],
            parameters: ['id'],
        },
        'storage.local': {
            uri: 'storage\/{path}',
            methods: ['GET', 'HEAD'],
            wheres: { path: '.*' },
            parameters: ['path'],
        },
    },
};
if (typeof window !== 'undefined' && typeof window.Ziggy !== 'undefined') {
    Object.assign(Ziggy.routes, window.Ziggy.routes);
}
export { Ziggy };
