// Minimal mock of @expo/vector-icons exports used in the app.
// Provide both named exports and a default export and mark as an ES module
// so Babel-style imports (`import { MaterialCommunityIcons } from ...`) work.
function IconMock(props) {
    return null;
}

const mock = {
    MaterialCommunityIcons: IconMock,
    AntDesign: IconMock,
    FontAwesome: IconMock,
    Ionicons: IconMock,
    default: IconMock,
    __esModule: true,
};

module.exports = mock;
