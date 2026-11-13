-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 13, 2026 at 03:21 PM
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
-- Table structure for table `archived_prescriptions`
--

CREATE TABLE `archived_prescriptions` (
  `id` varchar(10) NOT NULL,
  `patient_id` varchar(10) DEFAULT NULL,
  `patient_name` varchar(150) NOT NULL,
  `age_text` varchar(30) DEFAULT NULL,
  `sex` varchar(10) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `prescribed_date` date NOT NULL,
  `doctor_name` varchar(100) NOT NULL,
  `note` text DEFAULT NULL,
  `entered_by` varchar(20) NOT NULL,
  `entered_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `archived_prescription_items`
--

CREATE TABLE `archived_prescription_items` (
  `id` int(11) NOT NULL,
  `archived_id` varchar(10) NOT NULL,
  `medicine_name` varchar(150) NOT NULL,
  `dosage` varchar(50) DEFAULT NULL,
  `frequency` varchar(100) DEFAULT NULL,
  `duration` varchar(50) DEFAULT NULL,
  `quantity` varchar(30) DEFAULT NULL,
  `instructions` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `username` varchar(20) NOT NULL,
  `role` varchar(20) DEFAULT NULL,
  `action_name` varchar(100) NOT NULL,
  `details` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `created_at`, `username`, `role`, `action_name`, `details`) VALUES
(1, '2026-10-29 23:29:55', 'admin', 'Admin', 'Login', 'Signed in'),
(2, '2026-10-29 23:34:29', 'admin', 'unknown', 'Login failed', 'Wrong username or password'),
(3, '2026-10-29 23:34:49', 'admin', 'Admin', 'Login', 'Signed in'),
(4, '2026-10-29 23:35:04', 'admin', 'Admin', 'Password changed', 'User changed their own password'),
(5, '2026-10-29 23:35:10', 'admin', 'Admin', 'Logout', 'Signed out'),
(6, '2026-10-29 23:35:13', 'admin', 'Admin', 'Login', 'Signed in'),
(7, '2026-10-29 23:35:48', 'admin', 'Admin', 'Logout', 'Signed out'),
(8, '2026-10-29 23:35:57', 'admin', 'Admin', 'Login', 'Signed in'),
(9, '2026-10-29 23:37:02', 'admin', 'Admin', 'User updated', 'staff (Staff)'),
(10, '2026-10-29 23:37:12', 'admin', 'Admin', 'User updated', 'doctor (Doctor)'),
(11, '2026-10-29 23:37:27', 'admin', 'Admin', 'User updated', 'yuki (Admin)'),
(12, '2026-10-29 23:37:31', 'doctor', 'Doctor', 'Login', 'Signed in'),
(13, '2026-10-29 23:43:10', 'doctor', 'Doctor', 'Logout', 'Signed out'),
(14, '2026-10-29 23:43:20', 'admin', 'Admin', 'Login', 'Signed in'),
(15, '2026-10-29 23:47:36', 'admin', 'Admin', 'Patient registered', 'P-853817 mayku sendanw senden'),
(16, '2026-10-29 23:47:54', 'admin', 'Admin', 'Appointment created', 'A-0006 (queue 5)'),
(17, '2026-10-29 23:48:08', 'doctor', 'Doctor', 'Login', 'Signed in'),
(18, '2026-10-29 23:48:40', 'doctor', 'Doctor', 'Consultation created', 'C-0001'),
(19, '2026-10-29 23:48:53', 'doctor', 'Doctor', 'Consultation finished', 'A-0002 (P-0003)'),
(20, '2026-10-29 23:49:04', 'admin', 'Admin', 'Login', 'Signed in'),
(21, '2026-10-29 23:49:23', 'doctor', 'Doctor', 'Login', 'Signed in'),
(22, '2026-10-29 23:49:33', 'admin', 'Admin', 'Login', 'Signed in'),
(23, '2026-10-29 23:50:23', 'staff', 'Staff', 'Login', 'Signed in'),
(24, '2026-10-29 23:57:45', 'admin', 'Admin', 'Login', 'Signed in'),
(25, '2026-10-29 23:57:51', 'doctor', 'Doctor', 'Login', 'Signed in'),
(26, '2026-10-29 23:58:01', 'staff', 'Staff', 'Login', 'Signed in'),
(27, '2026-10-29 23:58:56', 'admin', 'Admin', 'Vital signs recorded', 'A-0006 (P-853817)'),
(28, '2026-10-29 23:59:16', 'admin', 'Admin', 'Vital signs recorded', 'A-0003 (P-0002)'),
(29, '2026-10-29 23:59:36', 'admin', 'Admin', 'Vital signs recorded', 'A-0004 (P-0004)'),
(30, '2026-10-29 23:59:38', 'admin', 'Admin', 'Appointment status', 'A-0003 changed to In Consultation'),
(31, '2026-10-29 23:59:49', 'doctor', 'Doctor', 'Consultation created', 'C-0002'),
(32, '2026-10-29 23:59:52', 'doctor', 'Doctor', 'Consultation finished', 'A-0003 (P-0002)'),
(33, '2026-10-30 00:00:03', 'staff', 'Staff', 'Bill choices saved', 'B-0003'),
(34, '2026-10-30 00:00:03', 'staff', 'Staff', 'Bill paid (cash)', 'B-0003 total 300'),
(35, '2026-10-30 00:00:25', 'doctor', 'Doctor', 'Doctor ready for patients', 'doctor'),
(36, '2026-10-30 00:00:35', 'admin', 'Admin', 'Appointment status', 'A-0004 changed to In Consultation'),
(37, '2026-10-30 00:00:41', 'doctor', 'Doctor', 'Doctor stopped accepting patients', 'doctor'),
(38, '2026-10-30 00:00:43', 'admin', 'Admin', 'Appointment status', 'A-0004 changed to Completed'),
(39, '2026-10-30 00:00:44', 'admin', 'Admin', 'Appointment status', 'A-0006 changed to In Consultation'),
(40, '2026-10-30 00:00:54', 'doctor', 'Doctor', 'Consultation updated', 'C-0002'),
(41, '2026-10-30 00:00:59', 'doctor', 'Doctor', 'Consultation updated', 'C-0001'),
(42, '2026-10-30 00:01:11', 'doctor', 'Doctor', 'Consultation updated', 'C-0002'),
(43, '2026-10-30 00:02:03', 'admin', 'Admin', 'Bill choices saved', 'B-0004'),
(44, '2026-10-30 00:02:03', 'admin', 'Admin', 'Bill paid (cash)', 'B-0004 total 500'),
(45, '2026-10-30 00:02:15', 'admin', 'Admin', 'Bill choices saved', 'B-0002'),
(46, '2026-10-30 00:02:15', 'admin', 'Admin', 'Bill paid (cash)', 'B-0002 total 350'),
(47, '2026-10-30 00:03:09', 'admin', 'Admin', 'Bill choices saved', 'B-0001'),
(48, '2026-10-30 00:03:09', 'admin', 'Admin', 'Bill paid (cash)', 'B-0001 total 300'),
(49, '2026-10-30 00:03:17', 'admin', 'Admin', 'Appointment status', 'A-0006 changed to Completed'),
(50, '2026-10-30 00:09:32', 'admin', 'Admin', 'Appointment created', 'A-0007 (queue 1)'),
(51, '2026-10-30 00:09:44', 'admin', 'Admin', 'Vital signs recorded', 'A-0007 (P-853817)'),
(52, '2026-10-30 00:09:47', 'doctor', 'Doctor', 'Doctor ready for patients', 'doctor'),
(53, '2026-10-30 00:09:50', 'admin', 'Admin', 'Appointment status', 'A-0007 changed to In Consultation'),
(54, '2026-10-30 00:09:58', 'doctor', 'Doctor', 'Consultation created', 'C-0003'),
(55, '2026-10-30 00:09:58', 'doctor', 'Doctor', 'Consultation finished', 'A-0007 (P-853817)'),
(56, '2026-10-30 00:12:32', 'admin', 'Admin', 'Appointment created', 'A-0008 (queue 2)'),
(57, '2026-10-30 00:12:47', 'admin', 'Admin', 'Vital signs recorded', 'A-0008 (P-853817)'),
(58, '2026-10-30 00:12:48', 'admin', 'Admin', 'Appointment status', 'A-0008 changed to In Consultation'),
(59, '2026-10-30 00:12:56', 'doctor', 'Doctor', 'Consultation created', 'C-0004'),
(60, '2026-10-30 00:12:56', 'doctor', 'Doctor', 'Consultation finished', 'A-0008 (P-853817)'),
(61, '2026-10-30 00:13:12', 'doctor', 'Doctor', 'Prescription created', 'RX-0001'),
(62, '2026-10-30 00:18:11', 'admin', 'Admin', 'Appointment created', 'A-0009 (queue 3)'),
(63, '2026-10-30 00:18:29', 'admin', 'Admin', 'Vital signs recorded', 'A-0009 (P-853817)'),
(64, '2026-10-30 00:18:32', 'admin', 'Admin', 'Appointment status', 'A-0009 changed to In Consultation'),
(65, '2026-10-30 00:18:45', 'doctor', 'Doctor', 'Consultation created', 'C-0005'),
(66, '2026-10-30 00:18:45', 'doctor', 'Doctor', 'Consultation finished', 'A-0009 (P-853817)'),
(67, '2026-10-30 00:19:08', 'doctor', 'Doctor', 'Prescription created', 'RX-0002'),
(68, '2026-10-30 00:21:01', 'admin', 'Admin', 'Patient registered', 'P-775800 mayku adwawdwad senden'),
(69, '2026-10-30 00:21:15', 'admin', 'Admin', 'Appointment created', 'A-0010 (queue 4)'),
(70, '2026-10-30 00:21:27', 'admin', 'Admin', 'Vital signs recorded', 'A-0010 (P-775800)'),
(71, '2026-10-30 00:21:30', 'doctor', 'Doctor', 'Doctor stopped accepting patients', 'doctor'),
(72, '2026-10-30 00:21:33', 'doctor', 'Doctor', 'Doctor ready for patients', 'doctor'),
(73, '2026-10-30 00:21:35', 'admin', 'Admin', 'Appointment status', 'A-0010 changed to In Consultation'),
(74, '2026-10-30 00:21:48', 'doctor', 'Doctor', 'Consultation created', 'C-0006'),
(75, '2026-10-30 00:21:48', 'doctor', 'Doctor', 'Consultation finished', 'A-0010 (P-775800)'),
(76, '2026-10-30 00:22:02', 'admin', 'Admin', 'Bill choices saved', 'B-0009'),
(77, '2026-10-30 00:22:02', 'admin', 'Admin', 'Bill paid (cash)', 'B-0009 total 300'),
(78, '2026-10-30 00:23:05', 'admin', 'Admin', 'Patient registered', 'P-592176 mayku sendanw senden'),
(79, '2026-10-30 00:24:09', 'admin', 'Admin', 'Patient registered', 'P-935650 mayku sendanw senden'),
(80, '2026-10-30 00:24:25', 'admin', 'Admin', 'Patient updated', 'P-935650'),
(81, '2026-10-30 00:44:54', 'admin', 'Admin', 'Login', 'Signed in'),
(82, '2026-10-30 00:45:29', 'admin', 'Admin', 'Appointment created', 'A-0011 (queue 5)'),
(83, '2026-10-30 00:45:41', 'admin', 'Admin', 'Vital signs recorded', 'A-0011 (P-853817)'),
(84, '2026-10-30 00:45:48', 'admin', 'Admin', 'Appointment status', 'A-0011 changed to In Consultation'),
(85, '2026-10-30 00:45:52', 'doctor', 'Doctor', 'Login', 'Signed in'),
(86, '2026-10-30 00:46:06', 'doctor', 'Doctor', 'Consultation created', 'C-0007'),
(87, '2026-10-30 00:46:06', 'doctor', 'Doctor', 'Consultation finished', 'A-0011 (P-853817)'),
(88, '2026-10-30 00:52:17', 'admin', 'Admin', 'Patient archived', 'P-592176'),
(89, '2026-10-30 00:52:49', 'admin', 'Admin', 'Appointment created', 'A-0012 (queue 6)'),
(90, '2026-10-30 00:53:09', 'admin', 'Admin', 'Vital signs recorded', 'A-0012 (P-853817)'),
(91, '2026-10-30 00:53:12', 'admin', 'Admin', 'Appointment status', 'A-0012 changed to In Consultation'),
(92, '2026-10-30 00:53:21', 'doctor', 'Doctor', 'Consultation created', 'C-0008'),
(93, '2026-10-30 00:53:21', 'doctor', 'Doctor', 'Consultation finished', 'A-0012 (P-853817)'),
(94, '2026-10-30 00:53:44', 'admin', 'Admin', 'Bill choices saved', 'B-0011'),
(95, '2026-10-30 00:53:44', 'admin', 'Admin', 'Bill paid (cash)', 'B-0011 total 500'),
(96, '2026-10-30 00:56:11', 'admin', 'Admin', 'Appointment created', 'A-0013 (queue 7)'),
(97, '2026-10-30 00:56:20', 'admin', 'Admin', 'Vital signs recorded', 'A-0013 (P-0005)'),
(98, '2026-10-30 00:56:21', 'admin', 'Admin', 'Appointment status', 'A-0013 changed to In Consultation'),
(99, '2026-10-30 00:57:15', 'doctor', 'Doctor', 'Consultation created', 'C-0009'),
(100, '2026-10-30 00:57:15', 'doctor', 'Doctor', 'Consultation finished', 'A-0013 (P-0005)'),
(101, '2026-10-30 00:57:32', 'admin', 'Admin', 'Bill choices saved', 'B-0012'),
(102, '2026-10-30 00:57:32', 'admin', 'Admin', 'Bill paid (cash)', 'B-0012 total 150'),
(103, '2026-10-30 01:04:16', 'admin', 'Admin', 'Bill choices saved', 'B-0010'),
(104, '2026-10-30 01:04:16', 'admin', 'Admin', 'Bill paid (cash)', 'B-0010 total 500'),
(105, '2026-10-30 01:04:26', 'admin', 'Admin', 'Bill choices saved', 'B-0008'),
(106, '2026-10-30 01:04:26', 'admin', 'Admin', 'Bill paid (cash)', 'B-0008 total 350'),
(107, '2026-10-30 01:04:32', 'admin', 'Admin', 'Bill choices saved', 'B-0007'),
(108, '2026-10-30 01:04:32', 'admin', 'Admin', 'Bill paid (cash)', 'B-0007 total 150'),
(109, '2026-10-30 01:04:37', 'admin', 'Admin', 'Bill choices saved', 'B-0006'),
(110, '2026-10-30 01:04:38', 'admin', 'Admin', 'Bill paid (cash)', 'B-0006 total 300'),
(111, '2026-10-30 01:04:43', 'admin', 'Admin', 'Bill choices saved', 'B-0005'),
(112, '2026-10-30 01:04:43', 'admin', 'Admin', 'Bill paid (cash)', 'B-0005 total 300'),
(113, '2026-10-30 01:11:10', 'admin', 'Admin', 'Appointment created', 'A-0014 (queue 8)'),
(114, '2026-10-30 01:11:17', 'admin', 'Admin', 'Vital signs recorded', 'A-0014 (P-775800)'),
(115, '2026-10-30 01:11:19', 'admin', 'Admin', 'Appointment status', 'A-0014 changed to In Consultation'),
(116, '2026-10-30 01:11:31', 'doctor', 'Doctor', 'Consultation created', 'C-0010'),
(117, '2026-10-30 01:11:31', 'doctor', 'Doctor', 'Consultation finished', 'A-0014 (P-775800)'),
(118, '2026-10-30 01:12:32', 'admin', 'Admin', 'Bill choices saved', 'B-0013'),
(119, '2026-10-30 01:12:35', 'admin', 'Admin', 'Bill choices saved', 'B-0013'),
(120, '2026-10-30 01:12:35', 'admin', 'Admin', 'Bill paid (cash)', 'B-0013 total 80'),
(121, '2026-10-30 01:25:03', 'admin', 'Admin', 'Appointment created', 'A-0015 (queue 9)'),
(122, '2026-10-30 01:25:11', 'admin', 'Admin', 'Vital signs recorded', 'A-0015 (P-0005)'),
(123, '2026-10-30 01:25:13', 'admin', 'Admin', 'Appointment status', 'A-0015 changed to In Consultation'),
(124, '2026-10-30 01:25:22', 'doctor', 'Doctor', 'Consultation created', 'C-0011'),
(125, '2026-10-30 01:25:22', 'doctor', 'Doctor', 'Consultation finished', 'A-0015 (P-0005)'),
(126, '2026-10-30 01:40:10', 'admin', 'Admin', 'Login', 'Signed in'),
(127, '2026-10-30 01:41:02', 'admin', 'Admin', 'Login', 'Signed in'),
(128, '2026-10-30 01:41:37', 'admin', 'Admin', 'Login', 'Signed in'),
(129, '2026-10-30 01:42:13', 'admin', 'Admin', 'Login', 'Signed in'),
(130, '2026-10-30 01:42:14', 'admin', 'Admin', 'Login', 'Signed in'),
(131, '2026-10-30 01:42:20', 'doctor', 'Doctor', 'Login', 'Signed in'),
(132, '2026-10-30 01:43:51', 'admin', 'Admin', 'Login', 'Signed in'),
(133, '2026-10-30 01:44:29', 'admin', 'Admin', 'Login', 'Signed in'),
(134, '2026-10-30 01:44:30', 'admin', 'Admin', 'Login', 'Signed in'),
(135, '2026-10-30 01:44:30', 'admin', 'Admin', 'Login', 'Signed in'),
(136, '2026-10-30 01:44:31', 'admin', 'Admin', 'Login', 'Signed in'),
(137, '2026-10-30 01:44:31', 'admin', 'Admin', 'Login', 'Signed in'),
(138, '2026-10-30 01:44:31', 'admin', 'Admin', 'Login', 'Signed in'),
(139, '2026-10-30 01:44:32', 'admin', 'Admin', 'Login', 'Signed in'),
(140, '2026-10-30 01:44:40', 'admin', 'unknown', 'Login failed', 'Wrong username or password'),
(141, '2026-10-30 01:44:46', 'admin', 'Admin', 'Login', 'Signed in'),
(142, '2026-10-30 01:44:53', 'admin', 'Admin', 'Login', 'Signed in'),
(143, '2026-10-30 01:45:20', 'admin', 'Admin', 'Login', 'Signed in'),
(144, '2026-10-30 01:45:21', 'admin', 'Admin', 'Login', 'Signed in'),
(145, '2026-10-30 01:45:25', 'admin', 'Admin', 'Login', 'Signed in'),
(146, '2026-10-30 01:45:25', 'admin', 'Admin', 'Login', 'Signed in'),
(147, '2026-10-30 01:45:25', 'admin', 'Admin', 'Login', 'Signed in'),
(148, '2026-10-30 01:45:26', 'admin', 'Admin', 'Login', 'Signed in'),
(149, '2026-10-30 01:45:26', 'admin', 'Admin', 'Login', 'Signed in'),
(150, '2026-10-30 01:45:36', 'admin', 'Admin', 'Login', 'Signed in'),
(151, '2026-10-30 01:45:41', 'admin', 'Admin', 'Login', 'Signed in'),
(152, '2026-10-30 01:46:37', 'admin', 'Admin', 'Login', 'Signed in'),
(153, '2026-10-30 01:46:56', 'admin', 'Admin', 'Logout', 'Signed out'),
(154, '2026-10-30 01:46:57', 'admin', 'Admin', 'Login', 'Signed in'),
(155, '2026-10-30 01:47:59', 'admin', 'Admin', 'Appointment created', 'A-0016 (queue 10)'),
(156, '2026-10-30 01:48:10', 'admin', 'Admin', 'Vital signs recorded', 'A-0016 (P-0002)'),
(157, '2026-10-30 01:48:11', 'admin', 'Admin', 'Appointment status', 'A-0016 changed to In Consultation'),
(158, '2026-10-30 01:48:13', 'admin', 'Admin', 'Logout', 'Signed out'),
(159, '2026-10-30 01:48:18', 'admin', 'Admin', 'Login', 'Signed in'),
(160, '2026-10-30 01:48:22', 'doctor', 'Doctor', 'Login', 'Signed in'),
(161, '2026-10-30 01:48:33', 'doctor', 'Doctor', 'Consultation created', 'C-0012'),
(162, '2026-10-30 01:48:33', 'doctor', 'Doctor', 'Consultation finished', 'A-0016 (P-0002)'),
(163, '2026-10-30 01:48:51', 'doctor', 'Doctor', 'Doctor stopped accepting patients', 'doctor'),
(164, '2026-10-30 01:48:51', 'doctor', 'Doctor', 'Logout', 'Signed out'),
(165, '2026-10-30 01:48:53', 'doctor', 'Doctor', 'Login', 'Signed in'),
(166, '2026-10-30 01:57:46', 'admin', 'Admin', 'Login', 'Signed in'),
(167, '2026-10-30 01:58:00', 'admin', 'Admin', 'Login', 'Signed in'),
(168, '2026-10-30 01:58:08', 'yuki', 'Admin', 'Login', 'Signed in'),
(169, '2026-10-30 09:02:35', 'admin', 'Admin', 'Login', 'Signed in'),
(170, '2026-10-30 09:04:12', 'doctor', 'Doctor', 'Login', 'Signed in'),
(171, '2026-10-30 09:05:38', 'doctor', 'Doctor', 'Appointment status', 'A-0003 changed to Cancelled'),
(172, '2026-10-30 09:05:56', 'doctor', 'Doctor', 'Vital signs recorded', 'A-0004 (P-0004)'),
(173, '2026-10-30 09:06:06', 'doctor', 'Doctor', 'Appointment created', 'A-0006 (queue 5)'),
(174, '2026-10-30 09:06:19', 'doctor', 'Doctor', 'Vital signs recorded', 'A-0006 (P-775800)'),
(175, '2026-10-30 09:08:48', 'doctor', 'Doctor', 'Appointment status', 'A-0004 changed to Cancelled'),
(176, '2026-10-30 09:08:52', 'doctor', 'Doctor', 'Vital signs recorded', 'A-0006 (P-775800)'),
(177, '2026-10-30 09:09:00', 'doctor', 'Doctor', 'Consultation finished', 'A-0002 (P-0003)'),
(178, '2026-10-30 09:09:04', 'doctor', 'Doctor', 'Appointment status', 'A-0006 changed to In Consultation'),
(179, '2026-10-30 09:09:15', 'doctor', 'Doctor', 'Consultation created', 'C-0013'),
(180, '2026-10-30 09:09:15', 'doctor', 'Doctor', 'Consultation finished', 'A-0006 (P-775800)'),
(181, '2026-10-30 09:09:29', 'doctor', 'Doctor', 'Bill choices saved', 'B-0003'),
(182, '2026-10-30 09:09:33', 'doctor', 'Doctor', 'Bill choices saved', 'B-0003'),
(183, '2026-10-30 09:09:33', 'doctor', 'Doctor', 'Bill choices saved', 'B-0003'),
(184, '2026-10-30 09:09:34', 'doctor', 'Doctor', 'Bill choices saved', 'B-0003'),
(185, '2026-10-30 09:09:34', 'doctor', 'Doctor', 'Bill choices saved', 'B-0003'),
(186, '2026-10-30 09:09:35', 'doctor', 'Doctor', 'Bill choices saved', 'B-0003'),
(187, '2026-10-30 09:09:37', 'doctor', 'Doctor', 'Bill choices saved', 'B-0003'),
(188, '2026-10-30 09:09:37', 'doctor', 'Doctor', 'Bill paid (cash)', 'B-0003 total 120 (Senior Citizen discount 30)'),
(189, '2026-10-30 09:11:18', 'doctor', 'Doctor', 'Medication added', 'M-0001 pebolstat (pebolstat)'),
(190, '2026-10-30 09:11:23', 'doctor', 'Doctor', 'Medication added', 'M-0001 pebolstat (pebolstat)'),
(191, '2026-10-30 09:11:24', 'doctor', 'Doctor', 'Medication added', 'M-0001 pebolstat (pebolstat)'),
(192, '2026-10-30 09:14:54', 'doctor', 'Doctor', 'Medication added', 'M-0001 pebolstat (pebolstat)'),
(193, '2026-10-30 09:18:32', 'doctor', 'Doctor', 'Bill choices saved', 'B-0002'),
(194, '2026-10-30 09:18:32', 'doctor', 'Doctor', 'Bill paid (cash)', 'B-0002 total 350'),
(195, '2026-10-30 09:18:46', 'doctor', 'Doctor', 'Bill choices saved', 'B-0001'),
(196, '2026-10-30 09:18:50', 'doctor', 'Doctor', 'Bill choices saved', 'B-0001'),
(197, '2026-10-30 09:19:00', 'doctor', 'Doctor', 'Bill choices saved', 'B-0001'),
(198, '2026-10-30 09:19:00', 'doctor', 'Doctor', 'Bill paid (cash)', 'B-0001 total 300'),
(199, '2026-10-30 09:21:31', 'doctor', 'Doctor', 'Medication added', 'M-0001 pebolstat (pebolstat)'),
(200, '2026-10-30 09:24:22', 'admin', 'Admin', 'Login', 'Signed in'),
(201, '2026-10-30 09:24:29', 'admin', 'Admin', 'Medication added', 'M-0001 pebolstat (pebolstat)'),
(202, '2026-10-30 09:25:29', 'admin', 'Admin', 'Medication added', 'M-0002 paracetamol (paracetamol)'),
(203, '2026-10-30 09:47:15', 'admin', 'Admin', 'Login', 'Signed in'),
(204, '2026-10-30 09:47:30', 'admin', 'Admin', 'Appointment created', 'A-0007 (queue 6)'),
(205, '2026-10-30 09:47:36', 'admin', 'Admin', 'Appointment created', 'A-0008 (queue 7)'),
(206, '2026-10-30 09:47:40', 'admin', 'Admin', 'Appointment created', 'A-0009 (queue 8)'),
(207, '2026-10-30 09:47:59', 'admin', 'Admin', 'Vital signs recorded', 'A-0007 (P-0002)'),
(208, '2026-10-30 09:48:11', 'admin', 'Admin', 'Vital signs recorded', 'A-0008 (P-0004)'),
(209, '2026-10-30 09:48:20', 'admin', 'Admin', 'Vital signs recorded', 'A-0009 (P-853817)'),
(210, '2026-10-30 09:53:24', 'admin', 'Admin', 'Logout', 'Signed out'),
(211, '2026-10-30 09:53:26', 'admin', 'Admin', 'Login', 'Signed in'),
(212, '2026-10-30 09:53:36', 'admin', 'Admin', 'Appointment status', 'A-0007 changed to Missing'),
(213, '2026-10-30 09:53:47', 'admin', 'Admin', 'Appointment status', 'A-0008 changed to In Consultation'),
(214, '2026-10-30 09:53:51', 'admin', 'Admin', 'Appointment status', 'A-0007 changed to Waiting'),
(215, '2026-10-30 09:54:00', 'admin', 'Admin', 'Appointment status', 'A-0007 changed to Missing'),
(216, '2026-10-30 09:54:06', 'admin', 'Admin', 'Appointment status', 'A-0007 changed to Waiting'),
(217, '2026-10-30 09:54:17', 'doctor', 'Doctor', 'Login', 'Signed in'),
(218, '2026-10-30 09:54:29', 'doctor', 'Doctor', 'Consultation created', 'C-0014'),
(219, '2026-10-30 09:54:30', 'doctor', 'Doctor', 'Consultation finished', 'A-0008 (P-0004)'),
(220, '2026-10-30 09:54:39', 'doctor', 'Doctor', 'Prescription created', 'RX-0003'),
(221, '2026-10-30 09:54:48', 'doctor', 'Doctor', 'Bill choices saved', 'B-0004'),
(222, '2026-10-30 09:54:55', 'doctor', 'Doctor', 'Bill choices saved', 'B-0004'),
(223, '2026-10-30 09:55:02', 'doctor', 'Doctor', 'Logout', 'Signed out'),
(224, '2026-10-30 09:55:11', 'staff', 'Staff', 'Login', 'Signed in'),
(225, '2026-10-30 09:55:19', 'staff', 'Staff', 'Bill choices saved', 'B-0004'),
(226, '2026-10-30 09:55:20', 'staff', 'Staff', 'Bill paid (cash)', 'B-0004 total 180'),
(227, '2026-10-30 09:57:32', 'staff', 'Staff', 'Appointment status', 'A-0007 changed to In Consultation'),
(228, '2026-10-30 09:57:34', 'doctor', 'Doctor', 'Login', 'Signed in'),
(229, '2026-10-30 09:57:43', 'doctor', 'Doctor', 'Consultation created', 'C-0015'),
(230, '2026-10-30 09:57:43', 'doctor', 'Doctor', 'Consultation finished', 'A-0007 (P-0002)'),
(231, '2026-10-30 09:57:51', 'doctor', 'Doctor', 'Bill choices saved', 'B-0005'),
(232, '2026-10-30 09:57:51', 'doctor', 'Doctor', 'Bill paid (cash)', 'B-0005 total 300'),
(233, '2026-10-30 09:58:26', 'doctor', 'Doctor', 'Appointment status', 'A-0009 changed to In Consultation'),
(234, '2026-10-30 09:58:41', 'doctor', 'Doctor', 'Consultation created', 'C-0016'),
(235, '2026-10-30 09:58:42', 'doctor', 'Doctor', 'Consultation finished', 'A-0009 (P-853817)'),
(236, '2026-10-30 09:58:51', 'doctor', 'Doctor', 'Bill choices saved', 'B-0006'),
(237, '2026-10-30 09:58:51', 'doctor', 'Doctor', 'Bill paid (cash)', 'B-0006 total 64 (PWD discount 16)'),
(238, '2026-10-30 10:13:51', 'admin', 'Admin', 'Login', 'Signed in'),
(239, '2026-10-30 10:15:31', 'admin', 'Admin', 'Login', 'Signed in'),
(240, '2026-10-30 10:15:40', 'admin', 'Admin', 'Login', 'Signed in'),
(241, '2026-10-30 10:15:55', 'admin', 'Admin', 'Bill choices saved', 'B-0006'),
(242, '2026-10-30 10:15:59', 'admin', 'Admin', 'Bill choices saved', 'B-0006'),
(243, '2026-10-30 10:15:59', 'admin', 'Admin', 'Bill paid (cash)', 'B-0006 total 64 (PWD discount 16)'),
(244, '2026-10-30 10:17:56', 'admin', 'Admin', 'Login', 'Signed in'),
(245, '2026-10-30 10:18:09', 'admin', 'Admin', 'Login', 'Signed in'),
(246, '2026-10-30 10:36:36', 'admin', 'Admin', 'Logout', 'Signed out'),
(247, '2026-10-30 10:36:54', 'admin', 'Admin', 'Login', 'Signed in'),
(248, '2026-10-30 10:37:01', 'admin', 'Admin', 'Login', 'Signed in'),
(249, '2026-10-30 10:37:53', 'admin', 'Admin', 'Bill choices saved', 'B-0002'),
(250, '2026-10-30 10:37:53', 'admin', 'Admin', 'Bill paid (cash)', 'B-0002 total 350'),
(251, '2026-10-30 10:39:21', 'admin', 'Admin', 'Appointment created', 'A-0010 (queue 9)'),
(252, '2026-10-30 10:39:38', 'admin', 'Admin', 'Appointment created', 'A-0011 (queue 10)'),
(253, '2026-10-30 10:39:46', 'admin', 'Admin', 'Vital signs recorded', 'A-0010 (P-0001)'),
(254, '2026-10-30 10:39:50', 'admin', 'Admin', 'Appointment status', 'A-0010 changed to In Consultation'),
(255, '2026-10-30 10:39:59', 'doctor', 'Doctor', 'Login', 'Signed in'),
(256, '2026-10-30 10:40:08', 'doctor', 'Doctor', 'Consultation created', 'C-0017'),
(257, '2026-10-30 10:40:08', 'doctor', 'Doctor', 'Consultation finished', 'A-0010 (P-0001)'),
(258, '2026-10-30 10:40:16', 'doctor', 'Doctor', 'Appointment status', 'A-0010 changed to Completed'),
(259, '2026-10-30 10:47:53', 'doctor', 'Doctor', 'Logout', 'Signed out'),
(260, '2026-10-30 10:47:56', 'admin', 'Admin', 'Login', 'Signed in'),
(261, '2026-10-30 10:48:02', 'admin', 'Admin', 'Appointment created', 'A-0012 (queue 11)'),
(262, '2026-10-30 10:48:17', 'admin', 'Admin', 'Appointment status', 'A-0011 changed to In Consultation'),
(263, '2026-10-30 10:48:21', 'doctor', 'Doctor', 'Login', 'Signed in'),
(264, '2026-10-30 10:48:30', 'doctor', 'Doctor', 'Consultation created', 'C-0018'),
(265, '2026-10-30 10:48:30', 'doctor', 'Doctor', 'Consultation finished', 'A-0011 (P-0001)'),
(266, '2026-10-30 10:48:34', 'doctor', 'Doctor', 'Doctor ready for patients', 'doctor'),
(267, '2026-10-30 10:49:55', 'doctor', 'Doctor', 'Logout', 'Signed out'),
(268, '2026-10-30 10:49:57', 'admin', 'Admin', 'Login', 'Signed in'),
(269, '2026-10-30 10:50:02', 'admin', 'Admin', 'Logout', 'Signed out'),
(270, '2026-10-30 10:50:05', 'doctor', 'Doctor', 'Login', 'Signed in'),
(271, '2026-10-30 10:50:08', 'admin', 'Admin', 'Login', 'Signed in'),
(272, '2026-10-30 10:50:26', 'admin', 'Admin', 'Doctor stopped accepting patients', 'doctor'),
(273, '2026-10-30 10:50:26', 'admin', 'Admin', 'Logout', 'Signed out'),
(274, '2026-10-30 10:50:30', 'doctor', 'Doctor', 'Login', 'Signed in'),
(275, '2026-10-30 10:50:37', 'staff', 'Staff', 'Login', 'Signed in'),
(276, '2026-10-30 10:50:48', 'doctor', 'Doctor', 'Login', 'Signed in'),
(277, '2026-10-30 10:50:57', 'admin', 'Admin', 'Login', 'Signed in'),
(278, '2026-10-30 10:51:16', 'yuki', 'Admin', 'Login', 'Signed in'),
(279, '2026-10-30 10:51:39', 'yuki', 'Admin', 'User created', 'aikiro (Doctor)'),
(280, '2026-10-30 10:51:48', 'aikiro', 'Doctor', 'Login', 'Signed in'),
(281, '2026-10-30 10:53:27', 'aikiro', 'Doctor', 'Logout', 'Signed out'),
(282, '2026-10-30 10:53:42', 'admin', 'Admin', 'Login', 'Signed in'),
(283, '2026-10-30 10:59:56', 'doctor', 'Doctor', 'Login', 'Signed in'),
(284, '2026-10-30 11:00:40', 'doctor', 'Doctor', 'Logout', 'Signed out'),
(285, '2026-10-30 11:00:42', 'admin', 'Admin', 'Login', 'Signed in'),
(286, '2026-10-30 11:00:48', 'admin', 'Admin', 'Appointment status', 'A-0012 changed to In Consultation'),
(287, '2026-10-30 11:00:49', 'admin', 'Admin', 'Logout', 'Signed out'),
(288, '2026-10-30 11:00:57', 'aikiro', 'Doctor', 'Login', 'Signed in'),
(289, '2026-10-30 11:01:00', 'aikiro', 'Doctor', 'Logout', 'Signed out'),
(290, '2026-10-30 11:01:02', 'admin', 'Admin', 'Login', 'Signed in'),
(291, '2026-10-30 11:01:11', 'admin', 'Admin', 'Appointment updated', 'A-0012'),
(292, '2026-10-30 11:01:15', 'admin', 'Admin', 'Logout', 'Signed out'),
(293, '2026-10-30 11:01:20', 'aikiro', 'Doctor', 'Login', 'Signed in'),
(294, '2026-10-30 11:01:28', 'aikiro', 'Doctor', 'Consultation created', 'C-0019'),
(295, '2026-10-30 11:01:29', 'aikiro', 'Doctor', 'Consultation finished', 'A-0012 (P-0001)'),
(296, '2026-10-30 11:01:34', 'admin', 'Admin', 'Login', 'Signed in'),
(297, '2026-10-30 11:01:39', 'admin', 'Admin', 'Bill choices saved', 'B-0009'),
(298, '2026-10-30 11:01:39', 'admin', 'Admin', 'Bill paid (cash)', 'B-0009 total 100'),
(299, '2026-11-03 10:55:39', 'admin', 'Admin', 'Login', 'Signed in'),
(300, '2026-11-03 10:55:53', 'admin', 'Admin', 'Login', 'Signed in'),
(301, '2026-11-03 10:55:58', 'doctor', 'Doctor', 'Login', 'Signed in'),
(302, '2026-11-03 10:56:02', 'staff', 'Staff', 'Login', 'Signed in'),
(303, '2026-11-03 10:56:19', 'admin', 'Admin', 'Login', 'Signed in'),
(304, '2026-11-03 10:57:11', 'admin', 'Admin', 'Medication added', 'M-0003 pebolstata (pebolstata)'),
(305, '2026-11-03 11:18:21', 'admin', 'Admin', 'Login', 'Signed in'),
(306, '2026-11-03 11:18:45', 'admin', 'Admin', 'Appointment created', 'A-0013 (queue 1)'),
(307, '2026-11-03 11:18:56', 'admin', 'Admin', 'Vital signs recorded', 'A-0013 (P-0002)'),
(308, '2026-11-03 11:18:57', 'admin', 'Admin', 'Appointment status', 'A-0013 changed to In Consultation'),
(309, '2026-11-03 11:19:06', 'doctor', 'Doctor', 'Login', 'Signed in'),
(310, '2026-11-03 11:19:25', 'doctor', 'Doctor', 'Consultation created', 'C-0020'),
(311, '2026-11-03 11:19:26', 'doctor', 'Doctor', 'Consultation finished', 'A-0013 (P-0002)'),
(312, '2026-11-03 11:20:41', 'admin', 'Admin', 'Login', 'Signed in'),
(313, '2026-11-03 11:20:52', 'admin', 'Admin', 'Doctor ready for patients', 'doctor'),
(314, '2026-11-03 11:21:06', 'admin', 'Admin', 'Logout', 'Signed out'),
(315, '2026-11-03 11:21:13', 'staff', 'Staff', 'Login', 'Signed in'),
(316, '2026-11-03 11:21:28', 'admin', 'Admin', 'Login', 'Signed in'),
(317, '2026-11-03 11:21:37', 'admin', 'Admin', 'Appointment created', 'A-0014 (queue 2)'),
(318, '2026-11-03 11:21:40', 'admin', 'Admin', 'Appointment status', 'A-0014 changed to In Consultation'),
(319, '2026-11-03 11:21:51', 'doctor', 'Doctor', 'Login', 'Signed in'),
(320, '2026-11-03 11:22:35', 'doctor', 'Doctor', 'Consultation created', 'C-0021'),
(321, '2026-11-03 11:22:35', 'doctor', 'Doctor', 'Consultation finished', 'A-0014 (P-0002)'),
(322, '2026-11-03 11:23:07', 'admin', 'Admin', 'Login', 'Signed in'),
(323, '2026-11-03 11:23:30', 'admin', 'Admin', 'Patient updated', 'P-0001'),
(324, '2026-11-03 11:23:53', 'admin', 'Admin', 'Appointment created', 'A-0015 (queue 3)'),
(325, '2026-11-03 11:24:08', 'admin', 'Admin', 'Test result recorded', 'T-0001 (Getting Urine)'),
(326, '2026-11-03 11:24:08', 'admin', 'Admin', 'Test result saved', 'A-0015 Getting Urine'),
(327, '2026-11-03 11:24:18', 'admin', 'Admin', 'Appointment status', 'A-0015 changed to In Consultation'),
(328, '2026-11-03 11:36:50', 'admin', 'Admin', 'Appointment status', 'A-0015 changed to Completed'),
(329, '2026-11-03 11:37:04', 'admin', 'Admin', 'Bill choices saved', 'B-0012'),
(330, '2026-11-03 11:37:04', 'admin', 'Admin', 'Bill paid (cash)', 'B-0012 total 80'),
(331, '2026-11-03 11:37:20', 'admin', 'Admin', 'Bill choices saved', 'B-0011'),
(332, '2026-11-03 11:37:24', 'admin', 'Admin', 'Bill choices saved', 'B-0011'),
(333, '2026-11-03 11:37:33', 'admin', 'Admin', 'Bill choices saved', 'B-0011'),
(334, '2026-11-03 11:37:33', 'admin', 'Admin', 'Bill paid (cash)', 'B-0011 total 100'),
(335, '2026-11-06 22:57:18', 'admin', 'Admin', 'Login', 'Signed in'),
(336, '2026-11-06 22:57:41', 'admin', 'Admin', 'Medication updated', 'M-0001 pebolstat (pebolstat)'),
(337, '2026-11-06 22:58:15', 'admin', 'Admin', 'Logout', 'Signed out'),
(338, '2026-11-06 22:59:51', 'admin', 'Admin', 'Login', 'Signed in'),
(339, '2026-11-06 23:02:29', 'admin', 'Admin', 'Medication updated', 'M-0001 pebolstat (pebolstat)'),
(340, '2026-11-06 23:02:35', 'admin', 'Admin', 'Medication updated', 'M-0001 pebolstat (pebolstat)'),
(341, '2026-11-06 23:02:44', 'admin', 'Admin', 'Medication updated', 'M-0001 pebolstat (pebolstat)'),
(342, '2026-11-06 23:02:55', 'admin', 'Admin', 'Medication updated', 'M-0001 pebolstat (pebolstat)'),
(343, '2026-11-06 23:04:28', 'admin', 'Admin', 'Medication updated', 'M-0001 pebolstat (pebolstat)'),
(344, '2026-11-06 23:04:39', 'admin', 'Admin', 'Medication updated', 'M-0001 pebolstat (pebolstat)'),
(345, '2026-11-06 23:04:41', 'admin', 'Admin', 'Medication archived', 'M-0001'),
(346, '2026-11-06 23:08:56', 'admin', 'Admin', 'Logout', 'Signed out'),
(347, '2026-11-06 23:09:02', 'doctor', 'Doctor', 'Login', 'Signed in'),
(348, '2026-11-06 23:14:48', 'doctor', 'Doctor', 'Doctor stopped accepting patients', 'doctor'),
(349, '2026-11-06 23:14:48', 'doctor', 'Doctor', 'Logout', 'Signed out'),
(350, '2026-11-06 23:14:53', 'staff', 'Staff', 'Login', 'Signed in'),
(351, '2026-11-06 23:15:56', 'staff', 'Staff', 'Bill choices saved', 'B-0008'),
(352, '2026-11-06 23:16:00', 'staff', 'Staff', 'Bill choices saved', 'B-0008'),
(353, '2026-11-06 23:16:19', 'staff', 'Staff', 'Bill choices saved', 'B-0003'),
(354, '2026-11-06 23:16:26', 'staff', 'Staff', 'Logout', 'Signed out'),
(355, '2026-11-06 23:16:37', 'admin', 'Admin', 'Login', 'Signed in'),
(356, '2026-11-06 23:16:43', 'doctor', 'Doctor', 'Login', 'Signed in'),
(357, '2026-11-06 23:16:56', 'doctor', 'Doctor', 'Logout', 'Signed out'),
(358, '2026-11-06 23:16:59', 'admin', 'Admin', 'Login', 'Signed in'),
(359, '2026-11-06 23:17:05', 'staff', 'Staff', 'Login', 'Signed in'),
(360, '2026-11-06 23:17:12', 'staff', 'Staff', 'Logout', 'Signed out'),
(361, '2026-11-06 23:17:15', 'admin', 'Admin', 'Login', 'Signed in'),
(362, '2026-11-06 23:17:38', 'staff', 'Staff', 'Login', 'Signed in'),
(363, '2026-11-06 23:19:47', 'admin', 'Admin', 'Login', 'Signed in'),
(364, '2026-11-06 23:20:20', 'admin', 'Admin', 'Appointment created', 'A-0016 (queue 1)'),
(365, '2026-11-06 23:20:26', 'admin', 'Admin', 'Logout', 'Signed out'),
(366, '2026-11-06 23:20:31', 'admin', 'Admin', 'Login', 'Signed in'),
(367, '2026-11-06 23:20:44', 'admin', 'Admin', 'Appointment updated', 'A-0016'),
(368, '2026-11-06 23:21:04', 'admin', 'Admin', 'Test result recorded', 'T-0002 (Getting Blood)'),
(369, '2026-11-06 23:21:04', 'admin', 'Admin', 'Test result saved', 'A-0016 Getting Blood'),
(370, '2026-11-06 23:21:15', 'admin', 'Admin', 'Vital signs recorded', 'A-0016 (P-0004)'),
(371, '2026-11-06 23:21:21', 'admin', 'Admin', 'Appointment updated', 'A-0016'),
(372, '2026-11-06 23:21:27', 'aikiro', 'Doctor', 'Login', 'Signed in'),
(373, '2026-11-06 23:21:31', 'aikiro', 'Doctor', 'Doctor ready for patients', 'aikiro'),
(374, '2026-11-06 23:21:39', 'aikiro', 'Doctor', 'Doctor stopped accepting patients', 'aikiro'),
(375, '2026-11-06 23:21:41', 'aikiro', 'Doctor', 'Doctor ready for patients', 'aikiro'),
(376, '2026-11-06 23:21:50', 'aikiro', 'Doctor', 'Doctor stopped accepting patients', 'aikiro'),
(377, '2026-11-06 23:21:50', 'aikiro', 'Doctor', 'Logout', 'Signed out'),
(378, '2026-11-06 23:21:57', 'doctor', 'Doctor', 'Login', 'Signed in'),
(379, '2026-11-06 23:21:59', 'doctor', 'Doctor', 'Doctor ready for patients', 'doctor'),
(380, '2026-11-06 23:22:13', 'admin', 'Admin', 'Appointment status', 'A-0016 changed to In Consultation'),
(381, '2026-11-06 23:22:17', 'doctor', 'Doctor', 'Doctor stopped accepting patients', 'doctor'),
(382, '2026-11-06 23:22:23', 'doctor', 'Doctor', 'Logout', 'Signed out'),
(383, '2026-11-06 23:22:31', 'aikiro', 'Doctor', 'Login', 'Signed in'),
(384, '2026-11-06 23:22:35', 'admin', 'Admin', 'Appointment updated', 'A-0016'),
(385, '2026-11-06 23:22:38', 'aikiro', 'Doctor', 'Logout', 'Signed out'),
(386, '2026-11-06 23:22:45', 'doctor', 'Doctor', 'Login', 'Signed in'),
(387, '2026-11-06 23:23:00', 'admin', 'Admin', 'Appointment updated', 'A-0016'),
(388, '2026-11-06 23:23:08', 'admin', 'Admin', 'Appointment updated', 'A-0016'),
(389, '2026-11-06 23:23:14', 'doctor', 'Doctor', 'Logout', 'Signed out'),
(390, '2026-11-06 23:23:20', 'aikiro', 'Doctor', 'Login', 'Signed in'),
(391, '2026-11-06 23:23:34', 'aikiro', 'Doctor', 'Consultation finished', 'A-0016 (P-0004)'),
(392, '2026-11-06 23:23:53', 'aikiro', 'Doctor', 'Prescription created', 'RX-0004'),
(393, '2026-11-06 23:26:05', 'admin', 'Admin', 'Bill choices saved', 'B-0013'),
(394, '2026-11-06 23:26:11', 'admin', 'Admin', 'Bill choices saved', 'B-0013'),
(395, '2026-11-06 23:26:11', 'admin', 'Admin', 'Bill paid (cash)', 'B-0013 total 300'),
(396, '2026-11-06 23:26:25', 'admin', 'Admin', 'Bill choices saved', 'B-0010'),
(397, '2026-11-06 23:26:25', 'admin', 'Admin', 'Bill paid (cash)', 'B-0010 total 500'),
(398, '2026-11-07 14:44:30', 'admin', 'Admin', 'Login', 'Signed in'),
(399, '2026-11-07 14:44:46', 'doctor', 'Doctor', 'Login', 'Signed in'),
(400, '2026-11-07 14:45:00', 'admin', 'Admin', 'Logout', 'Signed out'),
(401, '2026-11-07 14:45:04', 'yuki', 'Admin', 'Login', 'Signed in'),
(402, '2026-11-07 14:56:51', 'doctor', 'Doctor', 'Logout', 'Signed out'),
(403, '2026-11-07 14:56:58', 'doctor', 'Doctor', 'Login', 'Signed in'),
(404, '2026-11-07 14:57:04', 'staff', 'Staff', 'Login', 'Signed in'),
(405, '2026-11-07 14:59:26', 'yuki', 'Admin', 'Medication added', 'M-0004 paracetamol (paracetamol)'),
(406, '2026-11-07 14:59:40', 'yuki', 'Admin', 'Medication updated', 'M-0004 paracetamol (paracetamol)'),
(407, '2026-11-07 14:59:52', 'yuki', 'Admin', 'Medication updated', 'M-0004 paracetamol (paracetamol)'),
(408, '2026-11-07 15:00:24', 'yuki', 'Admin', 'Medication updated', 'M-0002 paracetamol (paracetamol)'),
(409, '2026-11-07 15:00:45', 'yuki', 'Admin', 'Medication updated', 'M-0004 paracetamol (paracetamol)'),
(410, '2026-11-07 15:05:28', 'yuki', 'Admin', 'Medication added', 'M-0005 pebolstat (pebolstat)'),
(411, '2026-11-07 15:07:46', 'doctor', 'Doctor', 'Doctor ready for patients', 'doctor'),
(412, '2026-11-07 15:07:53', 'doctor', 'Doctor', 'Doctor stopped accepting patients', 'doctor'),
(413, '2026-11-07 15:07:54', 'doctor', 'Doctor', 'Doctor ready for patients', 'doctor'),
(414, '2026-11-07 15:07:56', 'doctor', 'Doctor', 'Doctor stopped accepting patients', 'doctor'),
(415, '2026-11-07 15:11:37', 'yuki', 'Admin', 'Appointment created', 'A-0017 (queue 1)'),
(416, '2026-11-07 15:11:39', 'yuki', 'Admin', 'Appointment status', 'A-0017 changed to Missing'),
(417, '2026-11-07 15:11:48', 'yuki', 'Admin', 'Appointment created', 'A-0018 (queue 2)'),
(418, '2026-11-07 15:11:52', 'yuki', 'Admin', 'Appointment status', 'A-0017 changed to Waiting'),
(419, '2026-11-07 15:11:58', 'yuki', 'Admin', 'Appointment status', 'A-0017 changed to Missing'),
(420, '2026-11-07 15:12:00', 'yuki', 'Admin', 'Appointment status', 'A-0017 changed to Waiting'),
(421, '2026-11-07 15:12:02', 'yuki', 'Admin', 'Appointment status', 'A-0017 changed to Missing'),
(422, '2026-11-07 15:15:22', 'yuki', 'Admin', 'Test result recorded', 'T-0003 (Getting Urine)'),
(423, '2026-11-07 15:15:22', 'yuki', 'Admin', 'Test result saved', 'A-0018 Getting Urine'),
(424, '2026-11-07 15:15:42', 'yuki', 'Admin', 'Vital signs recorded', 'A-0018 (P-0004)'),
(425, '2026-11-07 15:16:33', 'yuki', 'Admin', 'Appointment status', 'A-0018 changed to In Consultation'),
(426, '2026-11-07 15:16:53', 'doctor', 'Doctor', 'Logout', 'Signed out'),
(427, '2026-11-07 15:17:00', 'aikiro', 'Doctor', 'Login', 'Signed in'),
(428, '2026-11-07 15:21:17', 'yuki', 'Admin', 'Appointment status', 'A-0017 changed to Waiting'),
(429, '2026-11-07 15:24:29', 'aikiro', 'Doctor', 'Consultation created', 'C-0022'),
(430, '2026-11-07 15:24:30', 'aikiro', 'Doctor', 'Consultation created', 'C-0022'),
(431, '2026-11-07 15:25:28', 'aikiro', 'Doctor', 'Consultation created', 'C-0022'),
(432, '2026-11-07 15:25:28', 'aikiro', 'Doctor', 'Consultation finished', 'A-0018 (P-0004)'),
(433, '2026-11-07 15:29:54', 'aikiro', 'Doctor', 'Logout', 'Signed out'),
(434, '2026-11-07 15:29:59', 'doctor', 'Doctor', 'Login', 'Signed in'),
(435, '2026-11-07 15:40:41', 'yuki', 'Admin', 'Vital signs recorded', 'A-0017 (P-0002)'),
(436, '2026-11-07 15:40:44', 'yuki', 'Admin', 'Appointment status', 'A-0017 changed to In Consultation'),
(437, '2026-11-07 16:01:43', 'admin', 'unknown', 'Login failed', 'Wrong username or password'),
(438, '2026-11-07 16:01:56', 'admin', 'Admin', 'Login', 'Signed in'),
(439, '2026-11-07 16:02:12', 'doctor', 'Doctor', 'Login', 'Signed in'),
(440, '2026-11-07 16:19:01', 'admin', 'Admin', 'Login', 'Signed in'),
(441, '2026-11-07 16:20:11', 'doctor', 'Doctor', 'Consultation created', 'C-0023'),
(442, '2026-11-07 16:20:22', 'doctor', 'Doctor', 'Consultation finished', 'A-0017 (P-0002)'),
(443, '2026-11-07 16:20:48', 'doctor', 'Doctor', 'Doctor ready for patients', 'doctor'),
(444, '2026-11-07 16:25:44', 'doctor', 'Doctor', 'Doctor stopped accepting patients', 'doctor'),
(445, '2026-11-07 16:27:11', 'doctor', 'Doctor', 'Consultation created', 'C-0024'),
(446, '2026-11-07 16:27:47', 'doctor', 'Doctor', 'Consultation updated', 'C-0024'),
(447, '2026-11-07 16:28:36', 'doctor', 'Doctor', 'Consultation updated', 'C-0023'),
(448, '2026-11-07 16:28:41', 'doctor', 'Doctor', 'Doctor ready for patients', 'doctor'),
(449, '2026-11-07 16:28:48', 'doctor', 'Doctor', 'Doctor stopped accepting patients', 'doctor'),
(450, '2026-11-07 16:28:49', 'doctor', 'Doctor', 'Doctor ready for patients', 'doctor'),
(451, '2026-11-07 16:28:53', 'doctor', 'Doctor', 'Doctor stopped accepting patients', 'doctor'),
(452, '2026-11-07 16:28:54', 'doctor', 'Doctor', 'Doctor ready for patients', 'doctor'),
(453, '2026-11-07 16:29:06', 'doctor', 'Doctor', 'Doctor stopped accepting patients', 'doctor'),
(454, '2026-11-07 16:29:07', 'doctor', 'Doctor', 'Doctor ready for patients', 'doctor'),
(455, '2026-11-07 17:06:39', 'admin', 'Admin', 'Login', 'Signed in'),
(456, '2026-11-07 17:06:49', 'doctor', 'unknown', 'Login failed', 'Wrong username or password'),
(457, '2026-11-07 17:06:53', 'doctor', 'Doctor', 'Login', 'Signed in'),
(458, '2026-11-07 17:50:50', 'admin', 'Admin', 'Login', 'Signed in'),
(459, '2026-11-07 17:50:57', 'admin', 'Admin', 'Logout', 'Signed out'),
(460, '2026-11-07 17:51:01', 'admin', 'Admin', 'Login', 'Signed in'),
(461, '2026-11-07 17:51:33', 'doctor', 'Doctor', 'Login', 'Signed in'),
(462, '2026-11-07 17:52:16', 'doctor', 'Doctor', 'Doctor stopped accepting patients', 'doctor'),
(463, '2026-11-07 17:54:55', 'doctor', 'Doctor', 'Consultation updated', 'C-0001'),
(464, '2026-11-07 17:55:02', 'doctor', 'Doctor', 'Consultation updated', 'C-0001'),
(465, '2026-11-07 17:56:19', 'doctor', 'Doctor', 'Doctor ready for patients', 'doctor'),
(466, '2026-11-07 17:56:25', 'doctor', 'Doctor', 'Doctor stopped accepting patients', 'doctor'),
(467, '2026-11-13 12:29:29', 'admin', 'Admin', 'Login', 'Signed in'),
(468, '2026-11-13 12:31:12', 'doctor', 'Doctor', 'Login', 'Signed in'),
(469, '2026-11-13 12:31:43', 'staff', 'Staff', 'Login', 'Signed in'),
(470, '2026-11-13 12:38:42', 'doctor', 'Doctor', 'Logout', 'Signed out'),
(471, '2026-11-13 12:38:44', 'staff', 'Staff', 'Logout', 'Signed out'),
(472, '2026-11-13 12:38:46', 'admin', 'Admin', 'Logout', 'Signed out'),
(473, '2026-11-13 13:09:44', 'admin', 'Admin', 'Login', 'Signed in'),
(474, '2026-11-13 13:12:52', 'admin', 'Admin', 'Logout', 'Signed out'),
(475, '2026-11-13 13:13:20', 'admin', 'Admin', 'Login', 'Signed in'),
(476, '2026-11-13 13:18:28', 'admin', 'Admin', 'Patient registered', 'P-538938 aikiro commandante gallares'),
(477, '2026-11-13 13:21:18', 'admin', 'Admin', 'Appointment created', 'A-0019 (queue 1)'),
(478, '2026-11-13 13:22:01', 'admin', 'Admin', 'Appointment status', 'A-0019 changed to Missing'),
(479, '2026-11-13 13:24:51', 'admin', 'Admin', 'Appointment status', 'A-0019 changed to Waiting'),
(480, '2026-11-13 13:33:22', 'admin', 'Admin', 'Medication added', 'M-0006 rosobastatin (roso)'),
(481, '2026-11-13 13:39:39', 'admin', 'Admin', 'User deactivated', 'aikiro'),
(482, '2026-11-13 13:41:22', 'admin', 'Admin', 'Medication archived', 'M-0005'),
(483, '2026-11-13 13:42:00', 'admin', 'Admin', 'Logout', 'Signed out'),
(484, '2026-11-13 13:43:03', 'doctor', 'Doctor', 'Login', 'Signed in'),
(485, '2026-11-13 13:45:39', 'doctor', 'Doctor', 'Logout', 'Signed out'),
(486, '2026-11-13 13:45:52', 'staff', 'Staff', 'Login', 'Signed in'),
(487, '2026-11-13 13:46:45', 'staff', 'Staff', 'Vital signs recorded', 'A-0019 (P-117829)'),
(488, '2026-11-13 13:46:50', 'staff', 'Staff', 'Appointment status', 'A-0019 changed to In Consultation'),
(489, '2026-11-13 13:46:56', 'staff', 'Staff', 'Logout', 'Signed out'),
(490, '2026-11-13 13:47:09', 'doctor', 'Doctor', 'Login', 'Signed in'),
(491, '2026-11-13 13:48:28', 'doctor', 'Doctor', 'Consultation created', 'C-0025'),
(492, '2026-11-13 13:48:28', 'doctor', 'Doctor', 'Consultation finished', 'A-0019 (P-117829)'),
(493, '2026-11-13 13:50:59', 'doctor', 'Doctor', 'Prescription created', 'RX-0005'),
(494, '2026-11-13 13:52:09', 'doctor', 'Doctor', 'Logout', 'Signed out'),
(495, '2026-11-13 13:52:34', 'staff', 'Staff', 'Login', 'Signed in'),
(496, '2026-11-13 13:55:12', 'staff', 'Staff', 'Bill choices saved', 'B-0016'),
(497, '2026-11-13 13:55:13', 'staff', 'Staff', 'Bill paid (cash)', 'B-0016 total 240 (Senior Citizen discount 60)'),
(498, '2026-11-13 13:55:38', 'staff', 'Staff', 'Logout', 'Signed out'),
(499, '2026-11-13 14:01:09', 'admin', 'Admin', 'Login', 'Signed in'),
(500, '2026-11-13 17:36:50', 'admin', 'Admin', 'Login', 'Signed in'),
(501, '2026-11-13 17:36:53', 'admin', 'Admin', 'Logout', 'Signed out'),
(502, '2026-11-13 17:44:05', 'admin', 'Admin', 'Login', 'Signed in'),
(503, '2026-11-13 17:44:07', 'admin', 'Admin', 'Logout', 'Signed out'),
(504, '2026-11-13 17:44:15', 'doctor', 'Doctor', 'Login', 'Signed in'),
(505, '2026-11-13 17:44:16', 'doctor', 'Doctor', 'Logout', 'Signed out'),
(506, '2026-11-13 18:02:28', 'admin', 'Admin', 'Login', 'Signed in'),
(507, '2026-11-13 18:14:58', 'admin', 'Admin', 'Logout', 'Signed out'),
(508, '2026-11-13 18:29:34', 'yuyi', 'unknown', 'Login failed', 'Wrong username or password'),
(509, '2026-11-13 18:29:45', 'admin', 'Admin', 'Login', 'Signed in'),
(510, '2026-11-13 18:29:55', 'admin', 'Admin', 'User activated', 'aikiro'),
(511, '2026-11-13 18:31:16', 'admin', 'Admin', 'Logout', 'Signed out'),
(512, '2026-11-13 18:34:25', 'admin', 'Admin', 'Login', 'Signed in'),
(513, '2026-11-13 18:41:57', 'admin', 'Admin', 'Logout', 'Signed out'),
(514, '2026-11-13 18:51:40', 'admin', 'Admin', 'Login', 'Signed in'),
(515, '2026-11-13 19:15:44', 'admin', 'Admin', 'Logout', 'Signed out'),
(516, '2026-11-13 19:15:53', 'admin', 'Admin', 'Login', 'Signed in');

-- --------------------------------------------------------

--
-- Table structure for table `bills`
--

CREATE TABLE `bills` (
  `id` varchar(10) NOT NULL,
  `queue_entry_id` varchar(10) NOT NULL,
  `patient_id` varchar(10) NOT NULL,
  `doctor_username` varchar(20) NOT NULL,
  `visit_date` date NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `status` enum('Open','Paid') NOT NULL DEFAULT 'Open',
  `total` int(11) NOT NULL DEFAULT 0,
  `payment_method` varchar(10) DEFAULT NULL,
  `cash_received` int(11) DEFAULT NULL,
  `change_amount` int(11) DEFAULT NULL,
  `paid_date` date DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `paid_by` varchar(20) DEFAULT NULL,
  `subtotal` int(11) NOT NULL DEFAULT 0,
  `discount_type` enum('None','Senior Citizen','PWD') NOT NULL DEFAULT 'None',
  `discount_id_number` varchar(30) DEFAULT NULL,
  `discount_amount` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bills`
--

INSERT INTO `bills` (`id`, `queue_entry_id`, `patient_id`, `doctor_username`, `visit_date`, `created_at`, `status`, `total`, `payment_method`, `cash_received`, `change_amount`, `paid_date`, `paid_at`, `paid_by`, `subtotal`, `discount_type`, `discount_id_number`, `discount_amount`) VALUES
('B-0001', 'A-0001', 'P-0001', 'doctor', '2026-10-30', '2026-10-30 10:15:42', 'Open', 0, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'None', NULL, 0),
('B-0002', 'A-0002', 'P-0003', 'doctor', '2026-10-30', '2026-10-30 10:15:42', 'Paid', 350, 'Cash', 350, 0, '2026-10-30', '2026-10-30 10:37:53', 'admin', 350, 'None', NULL, 0),
('B-0003', 'A-0006', 'P-775800', 'doctor', '2026-10-30', '2026-10-30 10:15:42', 'Open', 0, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'None', NULL, 0),
('B-0004', 'A-0007', 'P-0002', 'doctor', '2026-10-30', '2026-10-30 10:15:42', 'Open', 0, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'None', NULL, 0),
('B-0005', 'A-0008', 'P-0004', 'doctor', '2026-10-30', '2026-10-30 10:15:42', 'Open', 0, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'None', NULL, 0),
('B-0006', 'A-0009', 'P-853817', 'doctor', '2026-10-30', '2026-10-30 10:15:42', 'Paid', 64, 'Cash', 64, 0, '2026-10-30', '2026-10-30 10:15:59', 'admin', 80, 'PWD', '8559595123123123132132132', 16),
('B-0007', 'A-0010', 'P-0001', 'doctor', '2026-10-30', '2026-10-30 10:50:13', 'Open', 0, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'None', NULL, 0),
('B-0008', 'A-0011', 'P-0001', 'doctor', '2026-10-30', '2026-10-30 10:50:13', 'Open', 0, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'None', NULL, 0),
('B-0009', 'A-0012', 'P-0001', 'aikiro', '2026-10-30', '2026-10-30 11:01:35', 'Paid', 100, 'Cash', 100, 0, '2026-10-30', '2026-10-30 11:01:39', 'admin', 100, 'None', NULL, 0),
('B-0010', 'A-0013', 'P-0002', 'doctor', '2026-11-03', '2026-11-03 11:36:57', 'Paid', 500, 'Cash', 500, 0, '2026-11-06', '2026-11-06 23:26:25', 'admin', 500, 'None', NULL, 0),
('B-0011', 'A-0014', 'P-0002', 'doctor', '2026-11-03', '2026-11-03 11:36:57', 'Paid', 100, 'Cash', 100, 0, '2026-11-03', '2026-11-03 11:37:33', 'admin', 100, 'None', NULL, 0),
('B-0012', 'A-0015', 'P-0002', 'doctor', '2026-11-03', '2026-11-03 11:36:57', 'Paid', 80, 'Cash', 80, 0, '2026-11-03', '2026-11-03 11:37:04', 'admin', 80, 'None', NULL, 0),
('B-0013', 'A-0016', 'P-0004', 'aikiro', '2026-11-06', '2026-11-06 23:23:38', 'Paid', 300, 'Cash', 300, 0, '2026-11-06', '2026-11-06 23:26:11', 'admin', 300, 'None', NULL, 0),
('B-0014', 'A-0018', 'P-0004', 'aikiro', '2026-11-07', '2026-11-07 15:30:28', 'Open', 0, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'None', NULL, 0),
('B-0015', 'A-0017', 'P-0002', 'doctor', '2026-11-07', '2026-11-07 16:20:38', 'Open', 0, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'None', NULL, 0),
('B-0016', 'A-0019', 'P-117829', 'doctor', '2026-11-13', '2026-11-13 13:52:45', 'Paid', 240, 'Cash', 240, 0, '2026-11-13', '2026-11-13 13:55:12', 'staff', 300, 'Senior Citizen', 'OSCA-000126', 60);

-- --------------------------------------------------------

--
-- Table structure for table `bill_items`
--

CREATE TABLE `bill_items` (
  `id` varchar(30) NOT NULL,
  `bill_id` varchar(10) NOT NULL,
  `item_type` enum('service','medicine') NOT NULL,
  `name` varchar(150) NOT NULL,
  `prescription_id` varchar(10) DEFAULT NULL,
  `medication_id` varchar(10) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `unit_price` int(11) NOT NULL DEFAULT 0,
  `amount` int(11) NOT NULL DEFAULT 0,
  `decision` enum('Included','Buy here','Not buying') NOT NULL DEFAULT 'Included',
  `sellable` tinyint(1) NOT NULL DEFAULT 0,
  `note` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bill_items`
--

INSERT INTO `bill_items` (`id`, `bill_id`, `item_type`, `name`, `prescription_id`, `medication_id`, `quantity`, `unit_price`, `amount`, `decision`, `sellable`, `note`) VALUES
('RX-0001-1', 'B-0006', 'medicine', 'awdawd', 'RX-0001', NULL, 11, 0, 0, 'Not buying', 0, 'Not in the clinic medicine list'),
('RX-0002-1', 'B-0006', 'medicine', 'dawdawda', 'RX-0002', NULL, 1, 0, 0, 'Not buying', 0, 'Not in the clinic medicine list'),
('RX-0003-1', 'B-0005', 'medicine', 'paracetamol (paracetamol) 50 Tablet', 'RX-0003', NULL, 1, 0, 0, 'Not buying', 0, 'Not in the clinic medicine list'),
('RX-0004-1', 'B-0013', 'medicine', 'pebolstata (pebolstata) 500 Tablet', 'RX-0004', 'M-0003', 4, 0, 0, 'Not buying', 0, 'Expired'),
('RX-0005-1', 'B-0016', 'medicine', 'paracetamol (paracetamol) 500 Tablet', 'RX-0005', 'M-0002', 15, 30, 450, 'Not buying', 1, NULL),
('RX-0005-2', 'B-0016', 'medicine', 'bioflue', 'RX-0005', NULL, 2, 0, 0, 'Not buying', 0, 'Not in the clinic medicine list'),
('S-A-0001', 'B-0001', 'service', 'Check-up', NULL, NULL, 1, 300, 300, 'Included', 1, NULL),
('S-A-0002', 'B-0002', 'service', 'Blood Test', NULL, NULL, 1, 350, 350, 'Included', 1, NULL),
('S-A-0006', 'B-0003', 'service', 'Urine Test', NULL, NULL, 1, 150, 150, 'Included', 1, NULL),
('S-A-0007', 'B-0004', 'service', 'Check-up', NULL, NULL, 1, 300, 300, 'Included', 1, NULL),
('S-A-0008', 'B-0005', 'service', 'Urine Test', NULL, NULL, 1, 150, 150, 'Included', 1, NULL),
('S-A-0009', 'B-0006', 'service', 'Getting Urine', NULL, NULL, 1, 80, 80, 'Included', 1, NULL),
('S-A-0010', 'B-0007', 'service', 'Blood Test', NULL, NULL, 1, 350, 350, 'Included', 1, NULL),
('S-A-0011', 'B-0008', 'service', 'Getting Urine', NULL, NULL, 1, 80, 80, 'Included', 1, NULL),
('S-A-0012', 'B-0009', 'service', 'Getting Blood', NULL, NULL, 1, 100, 100, 'Included', 1, NULL),
('S-A-0013', 'B-0010', 'service', 'X-ray', NULL, NULL, 1, 500, 500, 'Included', 1, NULL),
('S-A-0014', 'B-0011', 'service', 'Getting Blood', NULL, NULL, 1, 100, 100, 'Included', 1, NULL),
('S-A-0015', 'B-0012', 'service', 'Getting Urine', NULL, NULL, 1, 80, 80, 'Included', 1, NULL),
('S-A-0016', 'B-0013', 'service', 'Check-up', NULL, NULL, 1, 300, 300, 'Included', 1, NULL),
('S-A-0017', 'B-0015', 'service', 'X-ray', NULL, NULL, 1, 500, 500, 'Included', 1, NULL),
('S-A-0018', 'B-0014', 'service', 'Getting Urine', NULL, NULL, 1, 80, 80, 'Included', 1, NULL),
('S-A-0019', 'B-0016', 'service', 'Check-up', NULL, NULL, 1, 300, 300, 'Included', 1, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` varchar(10) NOT NULL,
  `patient_account_id` int(11) NOT NULL,
  `patient_id` varchar(10) DEFAULT NULL,
  `visit_date` date NOT NULL,
  `slot_start` time NOT NULL,
  `reason` varchar(100) NOT NULL,
  `status` enum('Booked','Checked In','No Show','Cancelled') NOT NULL DEFAULT 'Booked',
  `queue_entry_id` varchar(10) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `clinic_settings`
--

CREATE TABLE `clinic_settings` (
  `setting_name` varchar(50) NOT NULL,
  `setting_value` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `clinic_settings`
--

INSERT INTO `clinic_settings` (`setting_name`, `setting_value`) VALUES
('no_show_grace_minutes', '10'),
('slot_minutes', '30');

-- --------------------------------------------------------

--
-- Table structure for table `consultations`
--

CREATE TABLE `consultations` (
  `id` varchar(10) NOT NULL,
  `patient_id` varchar(10) NOT NULL,
  `doctor_username` varchar(20) NOT NULL,
  `consult_date` date NOT NULL,
  `status` enum('In Progress','Completed') NOT NULL,
  `chief_complaint` varchar(255) NOT NULL,
  `symptoms` text DEFAULT NULL,
  `blood_pressure` varchar(10) DEFAULT NULL,
  `heart_rate` int(11) DEFAULT NULL,
  `temperature` decimal(4,1) DEFAULT NULL,
  `respiratory_rate` int(11) DEFAULT NULL,
  `weight` decimal(5,1) DEFAULT NULL,
  `height` decimal(5,1) DEFAULT NULL,
  `diagnosis` text NOT NULL,
  `treatment` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `follow_up_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `consultations`
--

INSERT INTO `consultations` (`id`, `patient_id`, `doctor_username`, `consult_date`, `status`, `chief_complaint`, `symptoms`, `blood_pressure`, `heart_rate`, `temperature`, `respiratory_rate`, `weight`, `height`, `diagnosis`, `treatment`, `notes`, `follow_up_date`) VALUES
('C-0001', 'P-0003', 'doctor', '2026-10-29', 'Completed', 'pain in chest', 'pain in chest', '120/80', 50, 45.0, 150, 105.0, 180.0, 'pain in chest', 'pain in chest', 'pain in chest', NULL),
('C-0002', 'P-0002', 'doctor', '2026-10-29', 'Completed', 'hikab', 'hikab', '180/50', 50, 45.0, 60, 150.0, 120.0, 'hikab', 'hikab', 'hikab', NULL),
('C-0003', 'P-853817', 'doctor', '2026-10-30', 'Completed', 'uboi', 'uboi', '120/80', 45, 45.0, 45, 30.0, 120.0, 'uboi', 'uboi', 'uboi', NULL),
('C-0004', 'P-853817', 'doctor', '2026-10-30', 'Completed', 'ihi', 'ihi', '120/80', 55, 45.0, 50, 120.0, 150.0, 'ihi', 'ihi', 'ihi', NULL),
('C-0005', 'P-853817', 'doctor', '2026-10-30', 'Completed', 'ubo', 'ubo', '120/80', 50, 45.0, 45, 45.0, 45.0, 'ubo', 'ubo', 'ubo', NULL),
('C-0006', 'P-775800', 'doctor', '2026-10-30', 'Completed', 'sakit sa likod', 'sakit sa likod', '180/50', 45, 45.0, 45, 80.0, 150.0, 'sakit sa likod', 'sakit sa likod', 'sakit sa likod', NULL),
('C-0007', 'P-853817', 'doctor', '2026-10-30', 'Completed', 'sakit sa likod', 'sakit sa likod', '120/50', 45, 45.0, 50, 150.0, 120.0, 'sakit sa likod', 'sakit sa likod', 'sakit sa likod', NULL),
('C-0008', 'P-853817', 'doctor', '2026-10-30', 'Completed', 'sakit sa panga', 'sakit sa panga', '120/80', 52, 45.0, 45, 45.0, 45.0, 'sakit sa panga', 'sakit sa panga', 'sakit sa panga', NULL),
('C-0009', 'P-0005', 'doctor', '2026-10-30', 'Completed', 'nothings new', 'nothings new', '120/82', 45, 45.0, 45, 45.0, 45.0, 'nothings new', 'nothings new', 'nothings new', NULL),
('C-0010', 'P-775800', 'doctor', '2026-10-30', 'Completed', 'sakit sa pantog', 'sakit sa pantog', '120/80', 45, 45.0, 45, 45.0, 45.0, 'sakit sa pantog', 'sakit sa pantog', 'sakit sa pantog', NULL),
('C-0011', 'P-0005', 'doctor', '2026-10-30', 'Completed', 'aray ko', 'aray ko', '120/80', 45, 45.0, 45, 45.0, 45.0, 'aray ko', 'aray ko', 'aray ko', NULL),
('C-0012', 'P-0002', 'doctor', '2026-10-30', 'Completed', 'sakit sa likod', 'sakit sa likod', '120/50', 45, 45.0, 45, 45.0, 45.0, 'sakit sa likod', 'sakit sa likod', 'sakit sa likod', NULL),
('C-0013', 'P-775800', 'doctor', '2026-10-30', 'Completed', 'sakit sa likod', 'sakit sa likod', '180/50', 45, 45.0, 45, 45.0, 45.0, 'sakit sa likod', 'sakit sa likod', 'sakit sa likod', NULL),
('C-0014', 'P-0004', 'doctor', '2026-10-30', 'Completed', 'sakit sa likod', 'sakit sa likod', '180/80', 45, 45.0, 45, 45.0, 45.0, 'sakit sa likod', 'sakit sa likod', 'sakit sa likod', NULL),
('C-0015', 'P-0002', 'doctor', '2026-10-30', 'Completed', 'sakit sa tyan', 'sakit sa tyan', '150/80', 45, 45.0, 45, 45.0, 45.0, 'sakit sa tyan', 'sakit sa tyan', 'sakit sa tyan', NULL),
('C-0016', 'P-853817', 'doctor', '2026-10-30', 'Completed', '50', '50', '180/80', 45, 454.0, 45, 45.0, 45.0, '50', '50', '05', NULL),
('C-0017', 'P-0001', 'doctor', '2026-10-30', 'Completed', 'haya', 'haya', '180/50', 45, 45.0, 45, 45.0, 45.0, 'haya', 'haya', 'haya', NULL),
('C-0018', 'P-0001', 'doctor', '2026-10-30', 'Completed', 'haya', 'haya', '180/50', 45, 45.0, 45, 45.0, 45.0, 'haya', 'haya', 'haya', NULL),
('C-0019', 'P-0001', 'aikiro', '2026-10-30', 'Completed', 'sakit sa panga', 'sakit sa panga', '180/50', 45, 45.0, 45, 45.0, 45.0, 'sakit sa panga', 'sakit sa panga', 'sakit sa panga', NULL),
('C-0020', 'P-0002', 'doctor', '2026-11-03', 'Completed', 'sakit sa likod', 'sakit sa likod', '180/80', 50, 45.0, 45, 45.0, 45.0, 'sakit sa likod', 'sakit sa likod', 'sakit sa likod', NULL),
('C-0021', 'P-0002', 'doctor', '2026-11-03', 'Completed', 'sakit sa binti', 'sakit sa binti', '180/80', 50, 45.0, 45, 45.0, 45.0, 'sakit sa binti', 'sakit sa binti', 'sakit sa binti', NULL);
INSERT INTO `consultations` (`id`, `patient_id`, `doctor_username`, `consult_date`, `status`, `chief_complaint`, `symptoms`, `blood_pressure`, `heart_rate`, `temperature`, `respiratory_rate`, `weight`, `height`, `diagnosis`, `treatment`, `notes`, `follow_up_date`) VALUES
('C-0022', 'P-0004', 'aikiro', '2026-11-07', 'Completed', 'masakit pantog', 'lower back pain', '120/80', 45, 45.0, 45, 45.0, 45.0, 'inom tubig', 'inom tubig', 'drink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew Consultationdrink a lot of water and medicationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew ConsultationNew C', NULL);
INSERT INTO `consultations` (`id`, `patient_id`, `doctor_username`, `consult_date`, `status`, `chief_complaint`, `symptoms`, `blood_pressure`, `heart_rate`, `temperature`, `respiratory_rate`, `weight`, `height`, `diagnosis`, `treatment`, `notes`, `follow_up_date`) VALUES
('C-0023', 'P-0002', 'doctor', '2026-11-07', 'Completed', 'sakit sa panga', 'sakit sa panga', '120/80', 45, 45.0, 45, 45.0, 45.0, 'sakit sa panga', 'sakit sa panga', 'sakit sa panga', NULL),
('C-0024', 'P-0002', 'doctor', '2026-11-07', 'Completed', 'jhaya', 'jhaya', '120/80', 45, 45.0, 45, 45.0, 45.0, 'jhaya', 'jhaya', 'jhaya', NULL),
('C-0025', 'P-117829', 'doctor', '2026-11-13', 'Completed', 'sakit sa paa', 'gout', '120/50', 50, 45.0, 45, 45.0, 150.0, 'uric acid', 'meds and cold press', 'drink  awater daily', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `doctor_availability`
--

CREATE TABLE `doctor_availability` (
  `doctor_username` varchar(20) NOT NULL,
  `is_ready` tinyint(1) NOT NULL DEFAULT 0,
  `ready_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `doctor_availability`
--

INSERT INTO `doctor_availability` (`doctor_username`, `is_ready`, `ready_at`, `updated_at`) VALUES
('doctor', 0, '2026-11-07 17:56:18', '2026-11-07 17:56:25');

-- --------------------------------------------------------

--
-- Table structure for table `doctor_profiles`
--

CREATE TABLE `doctor_profiles` (
  `doctor_username` varchar(20) NOT NULL,
  `license_no` varchar(30) DEFAULT NULL,
  `ptr_no` varchar(30) DEFAULT NULL,
  `s2_no` varchar(30) DEFAULT NULL,
  `tin` varchar(30) DEFAULT NULL,
  `dea_no` varchar(30) DEFAULT NULL,
  `npi_no` varchar(30) DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `medications`
--

CREATE TABLE `medications` (
  `id` varchar(10) NOT NULL,
  `generic_name` varchar(100) NOT NULL,
  `brand_name` varchar(100) DEFAULT NULL,
  `strength` varchar(50) DEFAULT NULL,
  `form` varchar(30) DEFAULT NULL,
  `category` varchar(60) DEFAULT NULL,
  `route` varchar(30) DEFAULT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `unit` varchar(20) DEFAULT NULL,
  `reorder_level` int(11) NOT NULL DEFAULT 0,
  `unit_price` int(11) NOT NULL DEFAULT 0,
  `batch_number` varchar(50) DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `supplier` varchar(100) DEFAULT NULL,
  `indications` text DEFAULT NULL,
  `warnings` text DEFAULT NULL,
  `storage_instructions` varchar(255) DEFAULT NULL,
  `is_archived` tinyint(1) NOT NULL DEFAULT 0
) ;

--
-- Dumping data for table `medications`
--

INSERT INTO `medications` (`id`, `generic_name`, `brand_name`, `strength`, `form`, `category`, `route`, `stock`, `unit`, `reorder_level`, `unit_price`, `batch_number`, `expiry_date`, `supplier`, `indications`, `warnings`, `storage_instructions`, `is_archived`) VALUES
('M-0001', 'pebolstat', 'pebolstat', '300', 'Tablet', 'Analgesic / Antipyretic', 'Oral', 200, 'tablets', 10, 50, '5', '2026-12-25', 'mercuruy', NULL, NULL, NULL, 1),
('M-0002', 'paracetamol', 'paracetamol', '500', 'Tablet', 'Analgesic / Antipyretic', 'Oral', 99, 'tablets', 10, 30, '10', '2028-07-27', 'mercury', NULL, NULL, NULL, 0),
('M-0003', 'pebolstata', 'pebolstata', '500', 'Tablet', 'Analgesic / Antipyretic', 'Oral', 10, 'tablets', 10, 0, '5', '2026-11-05', NULL, NULL, NULL, NULL, 0),
('M-0004', 'paracetamol', 'paracetamol', '500', 'Tablet', 'Analgesic / Antipyretic', 'Oral', 50, 'tablets', 5, 0, NULL, '2026-12-08', 'mercury', NULL, NULL, NULL, 0),
('M-0005', 'pebolstat', 'pebolstat', '50', 'Tablet', 'Analgesic / Antipyretic', 'Oral', 50, 'tablets', 10, 0, '50', '2026-11-07', '50', NULL, NULL, NULL, 1),
('M-0006', 'rosobastatin', 'roso', '50', 'Tablet', 'Antibiotic', 'Oral', 50, 'tablets', 10, 50, '6', '2026-11-28', NULL, NULL, NULL, NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `patients`
--

CREATE TABLE `patients` (
  `id` varchar(10) NOT NULL,
  `first_name` varchar(60) NOT NULL,
  `middle_name` varchar(60) DEFAULT NULL,
  `last_name` varchar(60) NOT NULL,
  `birth_date` date NOT NULL,
  `gender` enum('Male','Female') NOT NULL,
  `civil_status` varchar(20) DEFAULT NULL,
  `contact_number` varchar(11) DEFAULT NULL,
  `lot_no` varchar(20) DEFAULT NULL,
  `barangay` varchar(60) DEFAULT NULL,
  `city` varchar(60) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `emergency_name` varchar(100) DEFAULT NULL,
  `emergency_relationship` varchar(50) DEFAULT NULL,
  `emergency_contact_number` varchar(11) DEFAULT NULL,
  `blood_type` varchar(5) DEFAULT NULL,
  `allergies` text DEFAULT NULL,
  `medical_conditions` text DEFAULT NULL,
  `current_medications` text DEFAULT NULL,
  `date_registered` date NOT NULL,
  `last_visit` date DEFAULT NULL,
  `is_archived` tinyint(1) NOT NULL DEFAULT 0,
  `is_pwd` tinyint(1) NOT NULL DEFAULT 0,
  `pwd_id` varchar(30) DEFAULT NULL,
  `senior_id` varchar(30) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `patients`
--

INSERT INTO `patients` (`id`, `first_name`, `middle_name`, `last_name`, `birth_date`, `gender`, `civil_status`, `contact_number`, `lot_no`, `barangay`, `city`, `address`, `emergency_name`, `emergency_relationship`, `emergency_contact_number`, `blood_type`, `allergies`, `medical_conditions`, `current_medications`, `date_registered`, `last_visit`, `is_archived`, `is_pwd`, `pwd_id`, `senior_id`) VALUES
('P-0001', 'Juan', 'Santos', 'Reyes', '1998-05-15', 'Male', 'Single', '09171234567', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'B+', NULL, 'None', 'None', '2026-10-23', '2026-10-30', 0, 0, NULL, NULL),
('P-0002', 'Maria', 'Lopez', 'Garcia', '1986-03-10', 'Female', NULL, '09181234567', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'None', 'None', '2026-10-23', '2026-11-07', 0, 0, NULL, NULL),
('P-0003', 'Pedro', 'Cruz', 'Santiago', '1972-08-20', 'Male', NULL, '09191234567', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'None', 'None', '2026-10-23', '2026-10-29', 0, 0, NULL, NULL),
('P-0004', 'Ana Mae', NULL, 'Villanueva', '2010-01-12', 'Female', NULL, '09201234567', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'None', 'None', '2026-10-23', '2026-11-07', 0, 0, NULL, NULL),
('P-0005', 'Carlos', NULL, 'Mendoza', '1960-04-05', 'Male', NULL, '09211234567', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'None', 'None', '2026-10-23', '2026-10-30', 0, 0, NULL, 'SC-0001'),
('P-117829', 'Teresita', 'Flores', 'Mangubat', '1954-03-03', 'Female', 'Widowed', '09170000026', '26', 'Dasmariñas', 'Makati City', 'Lot 26, Brgy. Dasmariñas, Makati City', 'Ben Mangubat', 'Child', '09180000026', 'B+', 'None', 'Cataract', 'None', '2026-10-27', '2026-11-13', 0, 0, NULL, 'OSCA-000126'),
('P-174611', 'Edgardo', 'Ramos', 'Lim', '1949-01-09', 'Male', 'Married', '09170000008', '17', 'Magallanes', 'Makati City', 'Lot 17, Brgy. Magallanes, Makati City', 'Grace Lim', 'Spouse', '09180000008', 'A+', 'None', 'Asthma', 'Salbutamol inhaler', '2026-10-09', NULL, 0, 0, NULL, 'OSCA-000108'),
('P-189747', 'Jerome', 'Alvarez', 'Pineda', '1981-03-26', 'Male', 'Married', '09170000014', '19', 'Guadalupe Nuevo', 'Makati City', 'Lot 19, Brgy. Guadalupe Nuevo, Makati City', 'Lea Pineda', 'Spouse', '09180000014', 'B+', 'Shellfish', 'None', 'None', '2026-10-15', NULL, 0, 0, NULL, NULL),
('P-229880', 'Eric', 'John', 'Salazar', '1983-08-31', 'Male', 'Married', '09170000025', '12', 'Magallanes', 'Makati City', 'Lot 12, Brgy. Magallanes, Makati City', 'Myra Salazar', 'Spouse', '09180000025', 'A+', 'None', 'None', 'None', '2026-10-26', NULL, 0, 0, NULL, NULL),
('P-231762', 'Jenny', 'Lyn', 'Mercado', '1966-04-18', 'Female', 'Widowed', '09170000005', '3', 'Guadalupe Nuevo', 'Makati City', 'Lot 3, Brgy. Guadalupe Nuevo, Makati City', 'Paolo Mercado', 'Child', '09180000005', 'A-', 'None', 'Asthma', 'Salbutamol inhaler', '2026-10-06', NULL, 0, 0, NULL, 'OSCA-000105'),
('P-234138', 'Ramon', 'Bautista', 'Cruz', '1958-12-01', 'Male', 'Married', '09170000006', '14', 'Pio Del Pilar', 'Makati City', 'Lot 14, Brgy. Pio Del Pilar, Makati City', 'Lorna Cruz', 'Spouse', '09180000006', 'O-', 'Sulfa drugs', 'Type 2 diabetes', 'Metformin 500 mg', '2026-10-07', NULL, 0, 0, NULL, 'OSCA-000106'),
('P-269127', 'Mylene', 'Dizon', 'Ong', '1979-11-08', 'Female', 'Married', '09170000015', '4', 'Palanan', 'Makati City', 'Lot 4, Brgy. Palanan, Makati City', 'Henry Ong', 'Spouse', '09180000015', 'A-', 'None', 'None', 'None', '2026-10-16', NULL, 0, 0, NULL, NULL),
('P-274890', 'Rico', 'Dizon', 'Santiago', '1972-09-30', 'Male', 'Married', '09170000004', '21', 'Olympia', 'Makati City', 'Lot 21, Brgy. Olympia, Makati City', 'Elena Santiago', 'Spouse', '09180000004', 'AB+', 'None', 'Hypertension', 'Amlodipine 5 mg', '2026-10-05', NULL, 0, 0, NULL, NULL),
('P-310364', 'Benjamin', 'Cruz', 'Aquino', '1975-05-03', 'Male', 'Married', '09170000010', '11', 'Bel-Air', 'Makati City', 'Lot 11, Brgy. Bel-Air, Makati City', 'Ana Aquino', 'Spouse', '09180000010', 'O+', 'None', 'None', 'None', '2026-10-11', NULL, 0, 0, NULL, NULL),
('P-310523', 'Melanie', 'Joy', 'Aguilar', '1992-01-28', 'Female', 'Single', '09170000024', '20', 'Palanan', 'Makati City', 'Lot 20, Brgy. Palanan, Makati City', 'Tony Aguilar', 'Sibling', '09180000024', 'O-', 'None', 'Mobility impairment', 'None', '2026-10-25', NULL, 0, 1, 'PWD-0301-2023', NULL),
('P-343766', 'Oscar', 'Villar', 'Dimaculangan', '1957-10-07', 'Male', 'Widowed', '09170000018', '22', 'Pio Del Pilar', 'Makati City', 'Lot 22, Brgy. Pio Del Pilar, Makati City', 'Jun Dimaculangan', 'Child', '09180000018', 'B+', 'None', 'Gout', 'Allopurinol 100 mg', '2026-10-19', NULL, 0, 0, NULL, 'OSCA-000118'),
('P-344051', 'Joanna', 'Marie', 'Villarin', '1996-05-27', 'Female', 'Single', '09170000028', '27', 'Bel-Air', 'Makati City', 'Lot 27, Brgy. Bel-Air, Makati City', 'Ed Villarin', 'Sibling', '09180000028', 'A-', 'None', 'None', 'None', '2026-10-29', NULL, 0, 0, NULL, NULL),
('P-375405', 'Leonora', 'Garcia', 'Tan', '1952-06-25', 'Female', 'Widowed', '09170000007', '9', 'Palanan', 'Makati City', 'Lot 9, Brgy. Palanan, Makati City', 'Victor Tan', 'Child', '09180000007', 'B-', 'None', 'Hypertension', 'Losartan 50 mg', '2026-10-08', NULL, 0, 0, NULL, 'OSCA-000107'),
('P-407579', 'Dennis', 'Roy', 'Enriquez', '1962-06-11', 'Male', 'Married', '09170000023', '24', 'Guadalupe Nuevo', 'Makati City', 'Lot 24, Brgy. Guadalupe Nuevo, Makati City', 'Elisa Enriquez', 'Spouse', '09180000023', 'AB-', 'None', 'Hypertension', 'Amlodipine 5 mg', '2026-10-24', NULL, 0, 0, NULL, 'OSCA-000123'),
('P-421731', 'Harold', 'James', 'Cuevas', '1970-09-16', 'Male', 'Married', '09170000029', '28', 'Olympia', 'Makati City', 'Lot 28, Brgy. Olympia, Makati City', 'Ana Cuevas', 'Spouse', '09180000029', 'O+', 'Penicillin', 'Hypertension', 'Losartan 50 mg', '2026-10-30', NULL, 0, 0, NULL, NULL),
('P-444018', 'Hannah', 'Grace', 'Tolentino', '1989-09-09', 'Female', 'Married', '09170000020', '18', 'Bel-Air', 'Makati City', 'Lot 18, Brgy. Bel-Air, Makati City', 'Paul Tolentino', 'Spouse', '09180000020', 'O+', 'None', 'None', 'None', '2026-10-21', NULL, 0, 0, NULL, NULL),
('P-493202', 'Angelica', 'Rose', 'Soriano', '1994-12-30', 'Female', 'Single', '09170000013', '7', 'San Antonio', 'Makati City', 'Lot 7, Brgy. San Antonio, Makati City', 'Dante Soriano', 'Sibling', '09180000013', 'O+', 'None', 'Mobility impairment', 'None', '2026-10-14', NULL, 0, 1, 'PWD-0045-2025', NULL),
('P-495063', 'Lucas', 'Gabriel', 'Cabrera', '2015-05-20', 'Male', 'Single', '09170000019', '16', 'Poblacion', 'Makati City', 'Lot 16, Brgy. Poblacion, Makati City', 'Shiela Cabrera', 'Parent', '09180000019', 'A+', 'None', 'None', 'None', '2026-10-20', NULL, 0, 0, NULL, NULL),
('P-538938', 'aikiro', 'commandante', 'gallares', '2026-11-09', 'Male', 'Single', '09561659865', '2161', 'lapaz', 'makti', 'Lot 2161, Brgy. lapaz, makti', 'james', 'Friend', '09565665666', 'B+', 'wallnut', 'tablet', 'heart', '2026-11-13', NULL, 0, 1, '199849654626', NULL),
('P-546839', 'Cecilia', 'Torres', 'Mendez', '1963-08-14', 'Female', 'Single', '09170000009', '6', 'Dasmariñas', 'Makati City', 'Lot 6, Brgy. Dasmariñas, Makati City', 'Ruben Mendez', 'Sibling', '09180000009', 'AB-', 'None', 'None', 'None', '2026-10-10', NULL, 0, 0, NULL, 'OSCA-000109'),
('P-554309', 'Mark', 'Joseph', 'Dela Rosa', '1985-07-22', 'Male', 'Married', '09170000002', '5', 'Bel-Air', 'Makati City', 'Lot 5, Brgy. Bel-Air, Makati City', 'Joy Dela Rosa', 'Spouse', '09180000002', 'B+', 'None', 'None', 'None', '2026-10-03', NULL, 0, 0, NULL, NULL),
('P-574661', 'Ana', 'Marie', 'Reyes', '1990-03-14', 'Female', 'Single', '09170000001', '12', 'Poblacion', 'Makati City', 'Lot 12, Brgy. Poblacion, Makati City', 'Carlos Reyes', 'Spouse', '09180000001', 'A+', 'Peanuts', 'None', 'None', '2026-10-02', NULL, 0, 0, NULL, NULL),
('P-592176', 'mayku', 'sendanw', 'senden', '2026-09-28', 'Male', 'Single', '09595959595', '26a5wd6aw5d', 'lapas', 'awdawdawdwad', 'Lot 26a5wd6aw5d, Brgy. lapas, awdawdawdwad', 'adwawdawdawd', 'Guardian', '09595955995', 'B+', 'None', 'None', 'None', '2026-10-30', NULL, 1, 0, NULL, NULL),
('P-634902', 'Vincent', 'Lorenzo', 'Padilla', '1987-04-16', 'Male', 'Single', '09170000021', '23', 'Olympia', 'Makati City', 'Lot 23, Brgy. Olympia, Makati City', 'Rosa Padilla', 'Parent', '09180000021', 'A+', 'None', 'None', 'None', '2026-10-22', NULL, 0, 0, NULL, NULL),
('P-674589', 'Grace', 'Ann', 'Lopez', '1968-02-19', 'Female', 'Married', '09170000017', '13', 'Dasmariñas', 'Makati City', 'Lot 13, Brgy. Dasmariñas, Makati City', 'Mario Lopez', 'Spouse', '09180000017', 'AB+', 'None', 'None', 'None', '2026-10-18', NULL, 0, 0, NULL, NULL),
('P-676394', 'Patrick', 'Ian', 'Reyes', '1996-07-04', 'Male', 'Single', '09170000016', '10', 'Magallanes', 'Makati City', 'Lot 10, Brgy. Magallanes, Makati City', 'Lourdes Reyes', 'Parent', '09180000016', 'O-', 'None', 'Hearing impairment', 'None', '2026-10-17', NULL, 0, 1, 'PWD-0112-2024', NULL),
('P-699507', 'Mark', 'Anthony', 'Sison', '2000-11-15', 'Male', 'Single', '09170000027', '9', 'Pio Del Pilar', 'Makati City', 'Lot 9, Brgy. Pio Del Pilar, Makati City', 'Lorna Sison', 'Parent', '09180000027', 'O+', 'None', 'None', 'None', '2026-10-28', NULL, 0, 0, NULL, NULL),
('P-711303', 'Carmela', 'Joy', 'Pascual', '2001-02-17', 'Female', 'Single', '09170000011', '2', 'Olympia', 'Makati City', 'Lot 2, Brgy. Olympia, Makati City', 'Jose Pascual', 'Parent', '09180000011', 'A+', 'None', 'None', 'None', '2026-10-12', NULL, 0, 0, NULL, NULL),
('P-725422', 'Kevin', 'Paul', 'Navarro', '2003-06-12', 'Male', 'Single', '09170000012', '15', 'Poblacion', 'Makati City', 'Lot 15, Brgy. Poblacion, Makati City', 'Nora Navarro', 'Parent', '09180000012', 'B+', 'Shellfish', 'None', 'None', '2026-10-13', NULL, 0, 0, NULL, NULL),
('P-775800', 'mayku', 'adwawdwad', 'senden', '1956-01-12', 'Male', 'Single', '09595656565', '2a6wd2a6w2d6aw26wa2d', 'adwwadawdawdwad123123123', 'adwawdawdawd', 'Lot 2a6wd2a6w2d6aw26wa2d, Brgy. adwwadawdawdwad123123123, adwawdawdawd', 'mayku senden', 'Spouse', '09559599595', 'AB-', 'None', 'None', 'None', '2026-10-30', '2026-10-30', 0, 0, NULL, '31212313212321313213213'),
('P-842457', 'Ruth', 'Anne', 'Bonifacio', '1977-12-24', 'Female', 'Married', '09170000022', '1', 'San Antonio', 'Makati City', 'Lot 1, Brgy. San Antonio, Makati City', 'Carlo Bonifacio', 'Spouse', '09180000022', 'B-', 'Penicillin', 'Hypertension', 'Losartan 50 mg', '2026-10-23', NULL, 0, 0, NULL, NULL),
('P-853817', 'mayku', 'sendanw', 'senden', '2026-10-28', 'Male', 'Single', '09556565656', '2161548', 'pobla', 'makati', 'Lot 2161548, Brgy. pobla, makati', 'mareanne', 'Parent', '09955995595', 'O-', 'None', 'None', 'None', '2026-10-29', '2026-10-30', 0, 1, '8559595123123123132132132', NULL),
('P-935650', 'mayku', 'sendanw', 'senden', '2026-09-28', 'Male', 'Married', '09599595959', '955595995599', 'lapas', 'makatiiii', 'Lot 955595995599, Brgy. lapas, makatiiii', 'mayku senden', 'Spouse', '09559595959', 'O-', 'None', 'None', 'None', '2026-10-30', NULL, 0, 0, NULL, NULL),
('P-947564', 'Liza', 'Mae', 'Villanueva', '1998-11-05', 'Female', 'Single', '09170000003', '8', 'San Antonio', 'Makati City', 'Lot 8, Brgy. San Antonio, Makati City', 'Ramon Villanueva', 'Parent', '09180000003', 'O+', 'None', 'None', 'None', '2026-10-04', NULL, 0, 0, NULL, NULL),
('P-976503', 'Rowena', 'Santos', 'Ilagan', '1959-07-07', 'Female', 'Married', '09170000030', '29', 'San Antonio', 'Makati City', 'Lot 29, Brgy. San Antonio, Makati City', 'Dante Ilagan', 'Spouse', '09180000030', 'AB+', 'None', 'Osteoarthritis', 'Ibuprofen 400 mg (as needed)', '2026-10-31', NULL, 0, 0, NULL, 'OSCA-000130');

-- --------------------------------------------------------

--
-- Table structure for table `patient_accounts`
--

CREATE TABLE `patient_accounts` (
  `id` int(11) NOT NULL,
  `username` varchar(20) NOT NULL,
  `contact_number` varchar(11) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `birth_date` date NOT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `guardian_name` varchar(100) DEFAULT NULL,
  `guardian_contact` varchar(11) DEFAULT NULL,
  `guardian_relationship` varchar(30) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `status` enum('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
  `patient_id` varchar(10) DEFAULT NULL,
  `reject_reason` varchar(255) DEFAULT NULL,
  `approved_by` varchar(20) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `is_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `patient_accounts`
--

INSERT INTO `patient_accounts` (`id`, `username`, `contact_number`, `full_name`, `birth_date`, `gender`, `email`, `guardian_name`, `guardian_contact`, `guardian_relationship`, `password_hash`, `status`, `patient_id`, `reject_reason`, `approved_by`, `approved_at`, `created_at`, `is_active`) VALUES
(1, 'yuyi', '09565565656', 'aikiro yuyi gallares', '2026-11-01', NULL, 'aikirogallares@gmail.com', NULL, NULL, NULL, '$2y$10$kOItmezO0jElj2mXrGrqK.zLQc4hQ1X54Euf96UJ0ZTpxEyedf3fe', 'Pending', NULL, NULL, NULL, NULL, '2026-11-13 18:29:12', 1);

-- --------------------------------------------------------

--
-- Table structure for table `patient_documents`
--

CREATE TABLE `patient_documents` (
  `id` int(11) NOT NULL,
  `patient_account_id` int(11) NOT NULL,
  `document_type` enum('Government ID','Selfie') NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `uploaded_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `prescriptions`
--

CREATE TABLE `prescriptions` (
  `id` varchar(10) NOT NULL,
  `patient_id` varchar(10) NOT NULL,
  `doctor_username` varchar(20) NOT NULL,
  `prescribed_date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `prescriptions`
--

INSERT INTO `prescriptions` (`id`, `patient_id`, `doctor_username`, `prescribed_date`) VALUES
('RX-0001', 'P-853817', 'doctor', '2026-10-30'),
('RX-0002', 'P-853817', 'doctor', '2026-10-30'),
('RX-0003', 'P-0004', 'doctor', '2026-10-30'),
('RX-0004', 'P-0004', 'aikiro', '2026-11-06'),
('RX-0005', 'P-117829', 'doctor', '2026-11-13');

-- --------------------------------------------------------

--
-- Table structure for table `prescription_items`
--

CREATE TABLE `prescription_items` (
  `id` int(11) NOT NULL,
  `prescription_id` varchar(10) NOT NULL,
  `medicine_name` varchar(150) NOT NULL,
  `dosage` varchar(50) DEFAULT NULL,
  `frequency` varchar(50) DEFAULT NULL,
  `duration` varchar(50) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `instructions` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `prescription_items`
--

INSERT INTO `prescription_items` (`id`, `prescription_id`, `medicine_name`, `dosage`, `frequency`, `duration`, `quantity`, `instructions`) VALUES
(1, 'RX-0001', 'awdawd', '12', '3', '4', 11, '1'),
(2, 'RX-0002', 'dawdawda', '1', '2', '3', 1, 'dirnk once a day'),
(3, 'RX-0003', 'paracetamol (paracetamol) 50 Tablet', '50', '1', '50', 1, '20'),
(4, 'RX-0004', 'pebolstata (pebolstata) 500 Tablet', '500', '5', '45', 4, '45'),
(5, 'RX-0005', 'paracetamol (paracetamol) 500 Tablet', '500', 'Once a day - morning', '15', 15, 'Take after food'),
(6, 'RX-0005', 'bioflue', '50', 'Once a day - noon', '15', 2, 'Take after food');

-- --------------------------------------------------------

--
-- Table structure for table `queue_entries`
--

CREATE TABLE `queue_entries` (
  `id` varchar(10) NOT NULL,
  `patient_id` varchar(10) NOT NULL,
  `doctor_username` varchar(20) NOT NULL,
  `visit_date` date NOT NULL,
  `reason` varchar(100) NOT NULL,
  `priority` enum('Regular','Senior Citizen','PWD','Emergency') NOT NULL DEFAULT 'Regular',
  `status` enum('Scheduled','Confirmed','Waiting','Missing','In Consultation','Completed','Cancelled') NOT NULL,
  `queue_number` int(11) DEFAULT NULL,
  `queued_at` datetime DEFAULT NULL,
  `started_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `doctor_finished_at` datetime DEFAULT NULL,
  `doctor_finished_by` varchar(20) DEFAULT NULL,
  `missing_at` datetime DEFAULT NULL,
  `returned_at` datetime DEFAULT NULL,
  `booking_id` varchar(10) DEFAULT NULL,
  `slot_start` time DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `queue_entries`
--

INSERT INTO `queue_entries` (`id`, `patient_id`, `doctor_username`, `visit_date`, `reason`, `priority`, `status`, `queue_number`, `queued_at`, `started_at`, `completed_at`, `doctor_finished_at`, `doctor_finished_by`, `missing_at`, `returned_at`, `booking_id`, `slot_start`) VALUES
('A-0001', 'P-0001', 'doctor', '2026-10-30', 'Check-up', 'Regular', 'Completed', 1, '2026-10-30 08:02:29', '2026-10-30 08:17:29', '2026-10-30 08:32:29', NULL, NULL, NULL, NULL, NULL, NULL),
('A-0002', 'P-0003', 'doctor', '2026-10-30', 'Blood Test', 'Regular', 'Completed', 2, '2026-10-30 08:27:29', '2026-10-30 08:52:29', '2026-10-30 09:09:00', '2026-10-30 09:09:00', 'doctor', NULL, NULL, NULL, NULL),
('A-0003', 'P-0002', 'doctor', '2026-10-30', 'Check-up', 'Regular', 'Cancelled', 3, '2026-10-30 08:47:29', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('A-0004', 'P-0004', 'doctor', '2026-10-30', 'X-ray', 'Regular', 'Cancelled', 4, '2026-10-30 08:57:29', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('A-0005', 'P-0002', 'doctor', '2026-10-20', 'Getting Blood', 'Regular', 'Cancelled', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('A-0006', 'P-775800', 'doctor', '2026-10-30', 'Urine Test', 'Regular', 'Completed', 5, '2026-10-30 09:06:06', '2026-10-30 09:09:04', '2026-10-30 09:09:15', '2026-10-30 09:09:15', 'doctor', NULL, NULL, NULL, NULL),
('A-0007', 'P-0002', 'doctor', '2026-10-30', 'Check-up', 'Regular', 'Completed', 6, '2026-10-30 09:47:30', '2026-10-30 09:57:32', '2026-10-30 09:57:43', '2026-10-30 09:57:43', 'doctor', '2026-10-30 09:54:00', '2026-10-30 09:54:06', NULL, NULL),
('A-0008', 'P-0004', 'doctor', '2026-10-30', 'Urine Test', 'Regular', 'Completed', 7, '2026-10-30 09:47:36', '2026-10-30 09:53:47', '2026-10-30 09:54:30', '2026-10-30 09:54:30', 'doctor', NULL, NULL, NULL, NULL),
('A-0009', 'P-853817', 'doctor', '2026-10-30', 'Getting Urine', 'Regular', 'Completed', 8, '2026-10-30 09:47:40', '2026-10-30 09:58:26', '2026-10-30 09:58:42', '2026-10-30 09:58:42', 'doctor', NULL, NULL, NULL, NULL),
('A-0010', 'P-0001', 'doctor', '2026-10-30', 'Blood Test', 'Regular', 'Completed', 9, '2026-10-30 10:39:21', '2026-10-30 10:39:50', '2026-10-30 10:40:16', '2026-10-30 10:40:08', 'doctor', NULL, NULL, NULL, NULL),
('A-0011', 'P-0001', 'doctor', '2026-10-30', 'Getting Urine', 'Regular', 'Completed', 10, '2026-10-30 10:39:38', '2026-10-30 10:48:17', '2026-10-30 10:48:30', '2026-10-30 10:48:30', 'doctor', NULL, NULL, NULL, NULL),
('A-0012', 'P-0001', 'aikiro', '2026-10-30', 'Getting Blood', 'Regular', 'Completed', 11, '2026-10-30 10:48:02', '2026-10-30 11:00:48', '2026-10-30 11:01:29', '2026-10-30 11:01:29', 'aikiro', NULL, NULL, NULL, NULL),
('A-0013', 'P-0002', 'doctor', '2026-11-03', 'X-ray', 'Regular', 'Completed', 1, '2026-11-03 11:18:45', '2026-11-03 11:18:57', '2026-11-03 11:19:25', '2026-11-03 11:19:25', 'doctor', NULL, NULL, NULL, NULL),
('A-0014', 'P-0002', 'doctor', '2026-11-03', 'Getting Blood', 'Regular', 'Completed', 2, '2026-11-03 11:21:37', '2026-11-03 11:21:40', '2026-11-03 11:22:35', '2026-11-03 11:22:35', 'doctor', NULL, NULL, NULL, NULL),
('A-0015', 'P-0002', 'doctor', '2026-11-03', 'Getting Urine', 'Regular', 'Completed', 3, '2026-11-03 11:23:53', '2026-11-03 11:24:18', '2026-11-03 11:36:50', NULL, NULL, NULL, NULL, NULL, NULL),
('A-0016', 'P-0004', 'aikiro', '2026-11-06', 'Check-up', 'Regular', 'Completed', 1, '2026-11-06 23:20:20', '2026-11-06 23:22:13', '2026-11-06 23:23:34', '2026-11-06 23:23:34', 'aikiro', NULL, NULL, NULL, NULL),
('A-0017', 'P-0002', 'doctor', '2026-11-07', 'X-ray', 'Regular', 'Completed', 1, '2026-11-07 15:11:37', '2026-11-07 15:40:44', '2026-11-07 16:20:22', '2026-11-07 16:20:22', 'doctor', '2026-11-07 15:12:02', '2026-11-07 15:21:17', NULL, NULL),
('A-0018', 'P-0004', 'aikiro', '2026-11-07', 'Getting Urine', 'Regular', 'Completed', 2, '2026-11-07 15:11:48', '2026-11-07 15:16:33', '2026-11-07 15:25:28', '2026-11-07 15:25:28', 'aikiro', NULL, NULL, NULL, NULL),
('A-0019', 'P-117829', 'doctor', '2026-11-13', 'Check-up', 'Regular', 'Completed', 1, '2026-11-13 13:21:18', '2026-11-13 13:46:50', '2026-11-13 13:48:28', '2026-11-13 13:48:28', 'doctor', '2026-11-13 13:22:01', '2026-11-13 13:24:51', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `service_fees`
--

CREATE TABLE `service_fees` (
  `service_name` varchar(50) NOT NULL,
  `price` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `test_results`
--

CREATE TABLE `test_results` (
  `id` varchar(10) NOT NULL,
  `queue_entry_id` varchar(10) NOT NULL,
  `patient_id` varchar(10) NOT NULL,
  `test_name` varchar(100) NOT NULL,
  `result_text` text NOT NULL,
  `recorded_by` varchar(20) NOT NULL,
  `recorded_at` datetime NOT NULL,
  `updated_by` varchar(20) DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `test_results`
--

INSERT INTO `test_results` (`id`, `queue_entry_id`, `patient_id`, `test_name`, `result_text`, `recorded_by`, `recorded_at`, `updated_by`, `updated_at`) VALUES
('T-0001', 'A-0015', 'P-0002', 'Getting Urine', 'she have a blood std', 'admin', '2026-11-03 11:24:08', NULL, NULL),
('T-0002', 'A-0016', 'P-0004', 'Getting Blood', 'daming kinain na chicharon high blood', 'admin', '2026-11-06 23:21:04', NULL, NULL),
('T-0003', 'A-0018', 'P-0004', 'Getting Urine', 'UTI', 'yuki', '2026-11-07 15:15:22', NULL, NULL);

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
('U-0001', 'admin', 'Clinic Administrator', 'Admin', '$2y$10$YPwIXNqPPhMXCAAC6LGS8u/FtI75N.Ad2LhHge9PP5Uw7plK2DmZu', 1, '2026-10-23 13:46:22'),
('U-0002', 'staff', 'Clinic Staff', 'Staff', '$2y$10$uSxxgz/46HPArfCqoSONpOtw1C9Pd8M6vquORl5LGVQhIBC38Oyjy', 1, '2026-10-23 13:46:22'),
('U-0003', 'doctor', 'Dr. Juan Dela Cruz', 'Doctor', '$2y$10$Od/sz7OBuz1IVHkjK1hWneElUGPEdsNYMibWcRvnxct5D7YOt941S', 1, '2026-10-23 13:46:22'),
('U-0004', 'yuki', 'yuki', 'Admin', '$2y$10$YkRjFewubfuy6QyVwKt4zehBMh3XCztd38.AHPvh9I8RK.Wr6U4RO', 1, '2026-10-23 13:46:22'),
('U-0005', 'aikiro', 'aikiro', 'Doctor', '$2y$10$ll3rXAyXzkWXP6yI5it8kOal030QfRBdT5cCz1jynj81jWj9C8R7a', 1, '2026-10-30 10:51:39');

-- --------------------------------------------------------

--
-- Table structure for table `vitals`
--

CREATE TABLE `vitals` (
  `queue_entry_id` varchar(10) NOT NULL,
  `blood_pressure` varchar(10) NOT NULL,
  `heart_rate` int(11) NOT NULL,
  `temperature` decimal(4,1) NOT NULL,
  `respiratory_rate` int(11) NOT NULL,
  `weight` decimal(5,1) NOT NULL,
  `height` decimal(5,1) DEFAULT NULL,
  `recorded_by` varchar(20) NOT NULL,
  `recorded_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vitals`
--

INSERT INTO `vitals` (`queue_entry_id`, `blood_pressure`, `heart_rate`, `temperature`, `respiratory_rate`, `weight`, `height`, `recorded_by`, `recorded_at`) VALUES
('A-0004', '180/100', 50, 45.0, 45, 45.0, 45.0, 'admin', '2026-10-30 09:05:56'),
('A-0006', '180/50', 45, 45.0, 45, 45.0, 45.0, 'admin', '2026-10-30 09:08:52'),
('A-0007', '150/80', 45, 45.0, 45, 45.0, 45.0, 'admin', '2026-10-30 09:47:59'),
('A-0008', '180/80', 45, 45.0, 45, 45.0, 45.0, 'admin', '2026-10-30 09:48:11'),
('A-0009', '180/80', 45, 454.0, 45, 45.0, 45.0, 'admin', '2026-10-30 09:48:20'),
('A-0010', '180/50', 45, 45.0, 45, 45.0, 45.0, 'admin', '2026-10-30 10:39:46'),
('A-0011', '180/50', 45, 45.0, 45, 45.0, 45.0, 'admin', '2026-10-30 10:39:46'),
('A-0012', '180/50', 45, 45.0, 45, 45.0, 45.0, 'admin', '2026-10-30 10:39:46'),
('A-0013', '180/80', 50, 45.0, 45, 45.0, 45.0, 'admin', '2026-11-03 11:18:56'),
('A-0014', '180/80', 50, 45.0, 45, 45.0, 45.0, 'admin', '2026-11-03 11:18:56'),
('A-0015', '180/80', 50, 45.0, 45, 45.0, 45.0, 'admin', '2026-11-03 11:18:56'),
('A-0016', '120/80', 45, 45.0, 45, 45.0, 45.0, 'admin', '2026-11-06 23:21:15'),
('A-0017', '120/80', 45, 45.0, 45, 45.0, 45.0, 'yuki', '2026-11-07 15:40:41'),
('A-0018', '120/80', 45, 45.0, 45, 45.0, 45.0, 'yuki', '2026-11-07 15:15:42'),
('A-0019', '120/50', 50, 45.0, 45, 45.0, 150.0, 'staff', '2026-11-13 13:46:45');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `archived_prescriptions`
--
ALTER TABLE `archived_prescriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patient_id` (`patient_id`);

--
-- Indexes for table `archived_prescription_items`
--
ALTER TABLE `archived_prescription_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `archived_id` (`archived_id`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_audit_time` (`created_at`);

--
-- Indexes for table `bills`
--
ALTER TABLE `bills`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `queue_entry_id` (`queue_entry_id`),
  ADD KEY `patient_id` (`patient_id`),
  ADD KEY `doctor_username` (`doctor_username`);

--
-- Indexes for table `bill_items`
--
ALTER TABLE `bill_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bill_id` (`bill_id`),
  ADD KEY `prescription_id` (`prescription_id`),
  ADD KEY `medication_id` (`medication_id`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_booking_slot` (`visit_date`,`slot_start`),
  ADD KEY `patient_account_id` (`patient_account_id`),
  ADD KEY `patient_id` (`patient_id`);

--
-- Indexes for table `clinic_settings`
--
ALTER TABLE `clinic_settings`
  ADD PRIMARY KEY (`setting_name`);

--
-- Indexes for table `consultations`
--
ALTER TABLE `consultations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patient_id` (`patient_id`),
  ADD KEY `doctor_username` (`doctor_username`);

--
-- Indexes for table `doctor_availability`
--
ALTER TABLE `doctor_availability`
  ADD PRIMARY KEY (`doctor_username`);

--
-- Indexes for table `doctor_profiles`
--
ALTER TABLE `doctor_profiles`
  ADD PRIMARY KEY (`doctor_username`);

--
-- Indexes for table `medications`
--
ALTER TABLE `medications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `patients`
--
ALTER TABLE `patients`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_patients_name` (`last_name`,`first_name`);

--
-- Indexes for table `patient_accounts`
--
ALTER TABLE `patient_accounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `patient_id` (`patient_id`);

--
-- Indexes for table `patient_documents`
--
ALTER TABLE `patient_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patient_account_id` (`patient_account_id`);

--
-- Indexes for table `prescriptions`
--
ALTER TABLE `prescriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patient_id` (`patient_id`),
  ADD KEY `doctor_username` (`doctor_username`);

--
-- Indexes for table `prescription_items`
--
ALTER TABLE `prescription_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `prescription_id` (`prescription_id`);

--
-- Indexes for table `queue_entries`
--
ALTER TABLE `queue_entries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_queue_day` (`visit_date`,`queue_number`),
  ADD KEY `patient_id` (`patient_id`),
  ADD KEY `doctor_username` (`doctor_username`);

--
-- Indexes for table `service_fees`
--
ALTER TABLE `service_fees`
  ADD PRIMARY KEY (`service_name`);

--
-- Indexes for table `test_results`
--
ALTER TABLE `test_results`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_test_queue` (`queue_entry_id`),
  ADD KEY `patient_id` (`patient_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `vitals`
--
ALTER TABLE `vitals`
  ADD PRIMARY KEY (`queue_entry_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `archived_prescription_items`
--
ALTER TABLE `archived_prescription_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=517;

--
-- AUTO_INCREMENT for table `patient_accounts`
--
ALTER TABLE `patient_accounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `patient_documents`
--
ALTER TABLE `patient_documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `prescription_items`
--
ALTER TABLE `prescription_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `archived_prescriptions`
--
ALTER TABLE `archived_prescriptions`
  ADD CONSTRAINT `archived_prescriptions_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`);

--
-- Constraints for table `archived_prescription_items`
--
ALTER TABLE `archived_prescription_items`
  ADD CONSTRAINT `archived_prescription_items_ibfk_1` FOREIGN KEY (`archived_id`) REFERENCES `archived_prescriptions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `bills`
--
ALTER TABLE `bills`
  ADD CONSTRAINT `bills_ibfk_3` FOREIGN KEY (`doctor_username`) REFERENCES `users` (`username`);

--
-- Constraints for table `bill_items`
--
ALTER TABLE `bill_items`
  ADD CONSTRAINT `bill_items_ibfk_1` FOREIGN KEY (`bill_id`) REFERENCES `bills` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`patient_account_id`) REFERENCES `patient_accounts` (`id`),
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`);

--
-- Constraints for table `consultations`
--
ALTER TABLE `consultations`
  ADD CONSTRAINT `consultations_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`),
  ADD CONSTRAINT `consultations_ibfk_2` FOREIGN KEY (`doctor_username`) REFERENCES `users` (`username`);

--
-- Constraints for table `doctor_availability`
--
ALTER TABLE `doctor_availability`
  ADD CONSTRAINT `doctor_availability_ibfk_1` FOREIGN KEY (`doctor_username`) REFERENCES `users` (`username`);

--
-- Constraints for table `doctor_profiles`
--
ALTER TABLE `doctor_profiles`
  ADD CONSTRAINT `doctor_profiles_ibfk_1` FOREIGN KEY (`doctor_username`) REFERENCES `users` (`username`);

--
-- Constraints for table `patient_accounts`
--
ALTER TABLE `patient_accounts`
  ADD CONSTRAINT `patient_accounts_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`);

--
-- Constraints for table `patient_documents`
--
ALTER TABLE `patient_documents`
  ADD CONSTRAINT `patient_documents_ibfk_1` FOREIGN KEY (`patient_account_id`) REFERENCES `patient_accounts` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `prescriptions`
--
ALTER TABLE `prescriptions`
  ADD CONSTRAINT `prescriptions_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`),
  ADD CONSTRAINT `prescriptions_ibfk_2` FOREIGN KEY (`doctor_username`) REFERENCES `users` (`username`);

--
-- Constraints for table `prescription_items`
--
ALTER TABLE `prescription_items`
  ADD CONSTRAINT `prescription_items_ibfk_1` FOREIGN KEY (`prescription_id`) REFERENCES `prescriptions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `queue_entries`
--
ALTER TABLE `queue_entries`
  ADD CONSTRAINT `queue_entries_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`),
  ADD CONSTRAINT `queue_entries_ibfk_2` FOREIGN KEY (`doctor_username`) REFERENCES `users` (`username`);

--
-- Constraints for table `test_results`
--
ALTER TABLE `test_results`
  ADD CONSTRAINT `test_results_ibfk_1` FOREIGN KEY (`queue_entry_id`) REFERENCES `queue_entries` (`id`),
  ADD CONSTRAINT `test_results_ibfk_2` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`);

--
-- Constraints for table `vitals`
--
ALTER TABLE `vitals`
  ADD CONSTRAINT `vitals_ibfk_1` FOREIGN KEY (`queue_entry_id`) REFERENCES `queue_entries` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
