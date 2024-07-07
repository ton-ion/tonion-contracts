<h1 align="center">
    <img alt="TonIon" src="./assets/banner.png" width="540" height="320" />
</h1>

<br/>

TonIon Contracts is a reusable smart contract library and toolkit for the Tact language on the TON blockchain. TonIon aims to provide reliable and efficient contract components to streamline the development of TON-based decentralized applications.

## Table of Contents

-   [Installation](#installation)
-   [Usage](#usage)
-   [Scripts](#scripts)
-   [Project Structure](#project-structure)
-   [Contributing](#contributing)
-   [Contributors](#contributors)
-   [License](#license)

## Usage

### Traits
add the `traits (contracts/traits)` to your project `contracts/imports`, then
Import the required contracts and traits in your Tact code:

```tact
import "./imports/traits/someCategory/SomeTrait.tact";

contract MyContract with someTrait {
    //your logic :)
}
```
### implementation
actually you can find implementation for the traits or TEPs in `mock (contracts/mock)` directory

<br>

We are working on a solution to use `npm` to install OpenGem Contracts and import them directly into your contracts without copying the files manually. Additionally, we are exploring potential changes in Tact to support importing directly from GitHub or similar platforms.

## Libraries

```plaintext
├── access
│   ├── ownableTransferable2Step
│   └── accessControl
├── utils
│   └── counter
├── payments
│   └── paymentSplitter
└── tokens
    └── jetton
        ├── basic(master and wallet)
        └── extensions
            ├── maxSupply
            └── approveable(in progress)
```

## Scripts

-   **Build All Contracts**: Compiles all the contracts in the library.

    ```sh
    npm run build:all
    ```

-   **Run Tests**: Executes the test suite using Jest.
    ```sh
    npm test
    ```

## Project Structure

```plaintext
├── contracts
│   ├── traits
│   │   └── (trait categories)
│   │       └── (trait files)
│   └── mocks
│   │   └── (mock categories)
│   │       └── (mock files)
├── tests
│   ├── (test categories)
│   │       └── (test files)
│   └── main.spec.ts
├── package.json
└── README.md
```

## Contributing

We welcome contributions from the community! If you'd like to contribute, please follow these steps:

1. Fork the repository.
2. Add a feature or fix a bug
3. Open a pull request.

## Contributors

<!-- readme: contributors -start -->
<table>
	<tbody>
		<tr>
            <td align="center">
                <a href="https://github.com/ZigBalthazar">
                    <img src="https://avatars.githubusercontent.com/u/42387185?v=4" width="50;" alt="ZigBalthazar"/>
                    <br />
                    <sub><b>Zig Blathazar</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/olumo-oke">
                    <img src="https://avatars.githubusercontent.com/u/173970179?v=4" width="50;" alt="olumo-oke"/>
                    <br />
                    <sub><b>olumo-oke</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/kehiy">
                    <img src="https://avatars.githubusercontent.com/u/89645414?v=4" width="50;" alt="kehiy"/>
                    <br />
                    <sub><b>Kay</b></sub>
                </a>
            </td>
		</tr>
	<tbody>
</table>
<!-- readme: contributors -end -->

## License

This project is licensed under the MIT License - see the [MIT License](LICENSE) file for details.
