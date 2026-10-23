-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 23, 2026 at 09:09 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dmc_carevault`
--

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(10) NOT NULL,
  `username` varchar(20) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `role` enum('Admin','Staff','Doctor') NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `full_name`, `role`, `password_hash`, `is_active`, `created_at`) VALUES
('U-0001', 'admin', 'Clinic Administrator', 'Admin', '$2y$10$OqVYmzT1Ww4l909U/kWT8.WqSJXc/bIqS5H0dsU5SR2Szg3azhkzq', 1, '2026-10-23 13:46:22'),
('U-0002', 'staff', 'Clinic Staff', 'Staff', '$2y$10$OKZoFjM0ozN1.QcBOcroAeHBfyFfo/fX7EZGvoxx0q52UhDG36BoO', 1, '2026-10-23 13:46:22'),
('U-0003', 'doctor', 'Dr. Juan Dela Cruz', 'Doctor', '$2y$10$AdReGOpMO4CaqiUkGu2wAeyog8M.akxf.gA3YBw8FuWG/bdbbr79.', 1, '2026-10-23 13:46:22'),
('U-0004', 'yuki', 'yuki', 'Admin', '$2y$10$BtzwWHc4IWw2kuv6y6E05uJ.AMNBXHSH1y8MbSx7I4DXz67jNi01e', 1, '2026-10-23 13:46:22');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
