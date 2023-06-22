# RFID Cloner

This repository contains the source code and documentation for an RFID Cloner project developed for the CIS 350 course. The project aims to create a device capable of cloning RFID cards using an ESP32 microcontroller and an RFID-RC522 module. The project includes a web app that interfaces with the ESP32 via Bluetooth Low Energy (BLE).

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Hardware Requirements](#hardware-requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)

## Introduction

The RFID Cloner is a project developed for CIS 350, a course focused on software engineering. The goal of this project is to design and implement a device capable of cloning RFID cards using an ESP32 microcontroller and an RFID-RC522 module. The project incorporates various technologies and techniques to achieve this goal, including Bluetooth Low Energy (BLE) communication and a web app interface.

## Features

- **RFID Card Cloning:** The primary feature of this project is the ability to clone RFID cards. The device reads the data from an existing RFID card using the RFID-RC522 module and writes it onto a blank card, effectively creating a clone.

- **Bluetooth Low Energy (BLE) Communication:** The project utilizes Bluetooth Low Energy (BLE) to establish communication between the web app and the ESP32 microcontroller. This enables wireless control and interaction with the RFID cloner.

- **Web App Interface:** The project includes a web app that serves as the user interface for interacting with the RFID cloner. The web app provides options to read and write RFID cards, as well as access additional settings and functionalities.

- **Error Handling:** The project incorporates robust error handling mechanisms to handle various scenarios, such as invalid or unreadable cards, communication errors, and user input errors. Clear error messages and prompts guide the user through the process.

## Hardware Requirements

To set up and use the RFID Cloner, you will need the following hardware components:

- ESP32 microcontroller
- RFID-RC522 module
- Bluetooth Low Energy (BLE) compatible device (such as a smartphone or computer) for running the web app interface

Please ensure that you have these hardware components before proceeding with the installation.

## Installation

To install and set up the RFID Cloner, follow these steps:

1. Clone the repository:

   ```shell
   git clone https://github.com/Jack-Lukomski/RFID_Cloner_CIS_350.git
   ```

2. Connect the RFID-RC522 module to the ESP32 microcontroller based on the provided schematics or pinout diagram.

3. Install any required software or libraries for the ESP32 microcontroller and the RFID-RC522 module, following their respective documentation.

4. Upload the provided firmware to the ESP32 microcontroller using the appropriate programming tool or environment.

5. Set up the web app interface on your Bluetooth Low Energy (BLE) compatible device by following the instructions in the web app's README file.

6. Power on the RFID Cloner device.

## Usage

To use the RFID Cloner, follow these steps:

1. Ensure that the RFID Cloner device is powered on and the ESP32 microcontroller is properly connected to the RFID-RC522 module.

2. On your Bluetooth Low Energy (BLE) compatible device, open the web app interface.

3. Follow the on-screen instructions provided by the web app to perform actions such as reading or writing RFID cards.

4. If any errors occur during the process, refer to the error messages displayed on the web app interface for guidance.

## Contributing

Contributions to this project are welcome. If

 you would like to contribute, please follow these steps:

1. Fork the repository.

2. Create a new branch for your feature or bug fix:

   ```shell
   git checkout -b my-feature
   ```

3. Make your changes and commit them with descriptive commit messages:

   ```shell
   git commit -m "Add new feature"
   ```

4. Push your changes to your forked repository:

   ```shell
   git push origin my-feature
   ```

5. Open a pull request in this repository, describing your changes and their purpose.
