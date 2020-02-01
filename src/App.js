import React from 'react';
import {BrowserRouter as Router, Route} from "react-router-dom";
import {createMuiTheme} from '@material-ui/core/styles';
import {ThemeProvider} from '@material-ui/core/styles';
import Orange from './Orange'

const App = () => {

  const theme = React.useMemo(
      () =>
          createMuiTheme({
            palette: {
              primary: {
                // light: will be calculated from palette.primary.main,
                main: '#0066ff',
                // dark: will be calculated from palette.primary.main,
                // contrastText: will be calculated to contrast with palette.primary.main
              },
              secondary: {
                main: '#ff9800'
              }
            },
          }),
  );

  return (
      <ThemeProvider theme={theme}>
          <Router>
            <div>
              {/*<PrivateRoute exact path="/" component={Dashboard}/>*/}
              {/*<Route exact path="/signup" component={SignUp2}/>*/}
              {/*<Route exact path="/login" component={Login}/>*/}
              <Route exact path="/orange" component={Orange}/>
              <Route exact path="/" component={Orange}/>
              {/*<Route exact path="/orangeanalytics" component={OrangeAnalytics}/>*/}
            </div>
          </Router>
      </ThemeProvider>
  )
};

export default App;