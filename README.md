[![PyPI version](https://badge.fury.io/py/webviz-subsurface-components.svg)](https://badge.fury.io/py/webviz-subsurface-components)
[![Build Status](https://travis-ci.org/equinor/webviz-subsurface-components.svg?branch=master)](https://travis-ci.org/equinor/webviz-subsurface-components)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/d89b3da9cd14462c9ee6b05f23ec75ee)](https://www.codacy.com/app/anders-kiaer/webviz-subsurface-components?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=equinor/webviz-subsurface-components&amp;utm_campaign=Badge_Grade)
[![Python 3.6+](https://img.shields.io/badge/python-3.6+-blue.svg)](https://www.python.org/)

# Webviz subsurface components

`webviz_subsurface_components` is a Dash component library for use in `webviz`.

You can quickly get started with:

1.  Run `pip install webviz-subsurface-components`
2.  Run `python examples/example_hm.py`
3.  Visit http://localhost:8050 in your web browser

## Contributing

This project was generated by the
[dash-component-boilerplate](https://github.com/plotly/dash-component-boilerplate).
It contains the minimal set of code required to create a custom Dash component.

### Install dependencies

If you have selected install_dependencies during the prompt, you can skip this part.

1. Install npm packages
    ```
    npm install
    ```
2. Create a virtual env and activate.
    ```
    virtualenv venv
    . venv/bin/activate
    ```
    _Note: venv\Scripts\activate for windows_

3. Install python packages required to build components.
    ```
    pip install .[dependencies]
    pip install dash[dev]
    ```
4. Install the python packages for testing (optional)
    ```
    pip install .[tests]
    pip install dash[testing]
    ```
    The second of these commands appears to be necessary as long as
    [this `pip` issue is open](https://github.com/pypa/pip/issues/4957).

### Write component code in `src/lib/components/<component_name>.react.js`

- The demo app is in `src/demo` and you will import your example component code into your demo app.
- Test your code in a Python environment:
    1. Build your code
        ```
        npm run build:all
        ```
    2. Run and modify the `usage.py` sample dash app:
        ```
        python usage.py
        ```
-   Write tests for your component.
    -   A sample test is available in `tests/test_usage.py`, it will load
        `usage.py` and you can then automate interactions with selenium.

    -   Run the tests with `pytest tests`.

    -   The Dash team uses these types of integration tests extensively.
        Browse the Dash component code on GitHub for more examples of testing
        (e.g. [dash-core-components](https://github.com/plotly/dash-core-components)).

-   Add custom styles to your component by putting your custom CSS files into
    your distribution folder (`webviz_subsurface_components`).
    -   Make sure that they are referenced in `MANIFEST.in` so that they get
        properly included when you're ready to publish your component.

    -   Make sure the stylesheets are added to the `_css_dist` dict in
        `webviz_subsurface_components/__init__.py` so dash will serve them
        automatically when the component suite is requested.

### Build code and install

1.  Build your code:
    ```
    npm run build:all
    ```
2.  Install the Python package:
    ```
    pip install -e .
    ```
