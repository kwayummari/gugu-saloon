-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Feb 29, 2024 at 08:17 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.1.17

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `gugu`
--

-- --------------------------------------------------------

--
-- Table structure for table `branch`
--

CREATE TABLE `branch` (
  `id` int(255) NOT NULL,
  `name` text NOT NULL,
  `date` text NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `branch`
--

INSERT INTO `branch` (`id`, `name`, `date`) VALUES
(1, 'Classic Mall', '2024-02-24 07:25:39'),
(2, 'Mawasiliano', '2024-02-24 07:25:39');

-- --------------------------------------------------------

--
-- Table structure for table `menu`
--

CREATE TABLE `menu` (
  `id` int(255) NOT NULL,
  `name` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `menu`
--

INSERT INTO `menu` (`id`, `name`) VALUES
(1, 'User Management'),
(2, 'Sales Management'),
(3, 'Purchase Order Management'),
(4, 'Stock Management'),
(5, 'Supplier Management'),
(6, 'Financial Management'),
(7, 'Report Management');

-- --------------------------------------------------------

--
-- Table structure for table `permission`
--

CREATE TABLE `permission` (
  `id` int(255) NOT NULL,
  `name` text NOT NULL,
  `icon` text NOT NULL DEFAULT 'faStar',
  `find` text NOT NULL DEFAULT '0',
  `increase` text NOT NULL DEFAULT '0',
  `upgrade` text NOT NULL DEFAULT '0',
  `remove` text NOT NULL DEFAULT '0',
  `roleId` text NOT NULL,
  `menuId` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `permission`
--

INSERT INTO `permission` (`id`, `name`, `icon`, `find`, `increase`, `upgrade`, `remove`, `roleId`, `menuId`) VALUES
(1, 'User Management', 'faStar', '1', '1', '1', '1', '1', '1'),
(2, 'Sales Management', 'faAddressCard', '1', '1', '1', '1', '1', '2'),
(3, 'Purchase Order Management', 'faBug', '1', '1', '1', '1', '1', '3'),
(4, 'Stock Management', 'faStar', '1', '1', '1', '1', '1', '4'),
(5, 'Supplier Management', 'faFileLines', '1', '1', '1', '1', '1', '5'),
(6, 'Financial Management', 'faLayerGroup', '1', '1', '1', '1', '1', '6'),
(7, 'Report Management', 'faPuzzlePiece', '1', '1', '1', '1', '1', '7'),
(9, 'Sales Management', 'faAddressCard', '1', '1', '1', '1', '2', '2'),
(10, 'Purchase Order Management', 'faBug', '1', '1', '1', '1', '2', '3'),
(11, 'Stock Management', 'faStar', '1', '1', '1', '1', '2', '4'),
(14, 'Report Management', 'faPuzzlePiece', '1', '1', '1', '1', '2', '7'),
(15, 'User Management', 'faPuzzlePiece', '1', '1', '1', '1', '2', '1'),
(16, 'Supplier Management', 'faFileLines', '0', '0', '0', '0', '2', '5'),
(17, 'Financial Management', 'faLayerGroup', '0', '0', '0', '0', '2', '6');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(255) NOT NULL,
  `name` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`) VALUES
(1, 'Super Admin'),
(2, 'Sales Manager'),
(3, 'Purchase Manager'),
(4, 'Finance Manager');

-- --------------------------------------------------------

--
-- Table structure for table `submenu`
--

CREATE TABLE `submenu` (
  `id` int(255) NOT NULL,
  `name` text NOT NULL,
  `menuId` text NOT NULL,
  `crud` text NOT NULL,
  `url` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `submenu`
--

INSERT INTO `submenu` (`id`, `name`, `menuId`, `crud`, `url`) VALUES
(2, 'All User', '1', '2', 'user'),
(3, 'Add Customer', '2', '1', 'addCustomer'),
(4, 'View Customer', '2', '2', 'viewCustomer'),
(5, 'Add Supplier', '3', '1', 'addSupplier'),
(6, 'View Supplier', '3', '2', 'viewSupplier');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int(255) NOT NULL,
  `fullname` text NOT NULL,
  `email` text NOT NULL,
  `phone` text NOT NULL,
  `branch` text NOT NULL,
  `role` text NOT NULL,
  `password` text NOT NULL,
  `date` text NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `fullname`, `email`, `phone`, `branch`, `role`, `password`, `date`) VALUES
(1, 'Kwayu Mmari', 'developerkwayu@gmail.com', '0762996305', '1', '1', '$2b$10$lHW6uk6BwGzM8Nbj2noULurgE2090Wxv3nicHstYKKygR1a6SCw9C', '2024-02-24 07:25:39'),
(2, 'Brian Kongola', 'brian@gmail.com', '0762996305', '1', '2', '$2b$10$Fc4i79O9nRXYLh3Itb90XezAIed1y4bGTTAQGCYiveZUg5tp1KzFm', '2024-02-24 07:25:39'),
(5, 'Andrew Msilu', 'msilu@gmail.com', '0716340430', '1', '3', '$2b$10$X4G8G5Gz8PRSufCea9bgsu9.tZgA1.XRLfIqiDFmlozttJKpLdT8a', '2024-02-27 01:19:51'),
(6, 'Ernest Malima', 'malimaernest@gmail.com', '0734712088', '2', '4', '$2b$10$8hU7sxFnVm9rTqhafqfeaO6gnJVqi6rBFiDdnE5IwkEjDVUvo.Ime', '2024-02-27 01:24:44');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `branch`
--
ALTER TABLE `branch`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `menu`
--
ALTER TABLE `menu`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `permission`
--
ALTER TABLE `permission`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `submenu`
--
ALTER TABLE `submenu`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `branch`
--
ALTER TABLE `branch`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `menu`
--
ALTER TABLE `menu`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `permission`
--
ALTER TABLE `permission`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `submenu`
--
ALTER TABLE `submenu`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
