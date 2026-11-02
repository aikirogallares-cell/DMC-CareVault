-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 30, 2026 at 04:07 AM
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
(298, '2026-10-30 11:01:39', 'admin', 'Admin', 'Bill paid (cash)', 'B-0009 total 100');

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
('B-0009', 'A-0012', 'P-0001', 'aikiro', '2026-10-30', '2026-10-30 11:01:35', 'Paid', 100, 'Cash', 100, 0, '2026-10-30', '2026-10-30 11:01:39', 'admin', 100, 'None', NULL, 0);

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
('RX-0003-1', 'B-0005', 'medicine', 'paracetamol (paracetamol) 50 Tablet', 'RX-0003', 'M-0002', 1, 30, 30, 'Buy here', 1, NULL),
('S-A-0001', 'B-0001', 'service', 'Check-up', NULL, NULL, 1, 300, 300, 'Included', 1, NULL),
('S-A-0002', 'B-0002', 'service', 'Blood Test', NULL, NULL, 1, 350, 350, 'Included', 1, NULL),
('S-A-0006', 'B-0003', 'service', 'Urine Test', NULL, NULL, 1, 150, 150, 'Included', 1, NULL),
('S-A-0007', 'B-0004', 'service', 'Check-up', NULL, NULL, 1, 300, 300, 'Included', 1, NULL),
('S-A-0008', 'B-0005', 'service', 'Urine Test', NULL, NULL, 1, 150, 150, 'Included', 1, NULL),
('S-A-0009', 'B-0006', 'service', 'Getting Urine', NULL, NULL, 1, 80, 80, 'Included', 1, NULL),
('S-A-0010', 'B-0007', 'service', 'Blood Test', NULL, NULL, 1, 350, 350, 'Included', 1, NULL),
('S-A-0011', 'B-0008', 'service', 'Getting Urine', NULL, NULL, 1, 80, 80, 'Included', 1, NULL),
('S-A-0012', 'B-0009', 'service', 'Getting Blood', NULL, NULL, 1, 100, 100, 'Included', 1, NULL);

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
  `diagnosis` varchar(255) NOT NULL,
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
('C-0019', 'P-0001', 'aikiro', '2026-10-30', 'Completed', 'sakit sa panga', 'sakit sa panga', '180/50', 45, 45.0, 45, 45.0, 45.0, 'sakit sa panga', 'sakit sa panga', 'sakit sa panga', NULL);

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
('M-0001', 'pebolstat', 'pebolstat', '300', 'Tablet', 'Analgesic / Antipyretic', 'Oral', 200, 'tablets', 10, 50, '5', '2028-11-30', 'mercuruy', NULL, NULL, NULL, 0),
('M-0002', 'paracetamol', 'paracetamol', '50', 'Tablet', 'Analgesic / Antipyretic', 'Oral', 99, 'tablets', 10, 30, '10', '2028-07-27', 'mercury', NULL, NULL, NULL, 0);

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
('P-0001', 'Juan', 'Santos', 'Reyes', '1998-05-15', 'Male', NULL, '09171234567', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'None', 'None', '2026-10-23', '2026-10-30', 0, 0, NULL, NULL),
('P-0002', 'Maria', 'Lopez', 'Garcia', '1986-03-10', 'Female', NULL, '09181234567', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'None', 'None', '2026-10-23', '2026-10-30', 0, 0, NULL, NULL),
('P-0003', 'Pedro', 'Cruz', 'Santiago', '1972-08-20', 'Male', NULL, '09191234567', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'None', 'None', '2026-10-23', '2026-10-29', 0, 0, NULL, NULL),
('P-0004', 'Ana Mae', NULL, 'Villanueva', '2010-01-12', 'Female', NULL, '09201234567', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'None', 'None', '2026-10-23', '2026-10-30', 0, 0, NULL, NULL),
('P-0005', 'Carlos', NULL, 'Mendoza', '1960-04-05', 'Male', NULL, '09211234567', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'None', 'None', '2026-10-23', '2026-10-30', 0, 0, NULL, 'SC-0001'),
('P-592176', 'mayku', 'sendanw', 'senden', '2026-09-28', 'Male', 'Single', '09595959595', '26a5wd6aw5d', 'lapas', 'awdawdawdwad', 'Lot 26a5wd6aw5d, Brgy. lapas, awdawdawdwad', 'adwawdawdawd', 'Guardian', '09595955995', 'B+', 'None', 'None', 'None', '2026-10-30', NULL, 1, 0, NULL, NULL),
('P-775800', 'mayku', 'adwawdwad', 'senden', '1956-01-12', 'Male', 'Single', '09595656565', '2a6wd2a6w2d6aw26wa2d', 'adwwadawdawdwad123123123', 'adwawdawdawd', 'Lot 2a6wd2a6w2d6aw26wa2d, Brgy. adwwadawdawdwad123123123, adwawdawdawd', 'mayku senden', 'Spouse', '09559599595', 'AB-', 'None', 'None', 'None', '2026-10-30', '2026-10-30', 0, 0, NULL, '31212313212321313213213'),
('P-853817', 'mayku', 'sendanw', 'senden', '2026-10-28', 'Male', 'Single', '09556565656', '2161548', 'pobla', 'makati', 'Lot 2161548, Brgy. pobla, makati', 'mareanne', 'Parent', '09955995595', 'O-', 'None', 'None', 'None', '2026-10-29', '2026-10-30', 0, 1, '8559595123123123132132132', NULL),
('P-935650', 'mayku', 'sendanw', 'senden', '2026-09-28', 'Male', 'Married', '09599595959', '955595995599', 'lapas', 'makatiiii', 'Lot 955595995599, Brgy. lapas, makatiiii', 'mayku senden', 'Spouse', '09559595959', 'O-', 'None', 'None', 'None', '2026-10-30', NULL, 0, 0, NULL, NULL);

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
('RX-0003', 'P-0004', 'doctor', '2026-10-30');

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
(3, 'RX-0003', 'paracetamol (paracetamol) 50 Tablet', '50', '1', '50', 1, '20');

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
  `returned_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `queue_entries`
--

INSERT INTO `queue_entries` (`id`, `patient_id`, `doctor_username`, `visit_date`, `reason`, `priority`, `status`, `queue_number`, `queued_at`, `started_at`, `completed_at`, `doctor_finished_at`, `doctor_finished_by`, `missing_at`, `returned_at`) VALUES
('A-0001', 'P-0001', 'doctor', '2026-10-30', 'Check-up', 'Regular', 'Completed', 1, '2026-10-30 08:02:29', '2026-10-30 08:17:29', '2026-10-30 08:32:29', NULL, NULL, NULL, NULL),
('A-0002', 'P-0003', 'doctor', '2026-10-30', 'Blood Test', 'Regular', 'Completed', 2, '2026-10-30 08:27:29', '2026-10-30 08:52:29', '2026-10-30 09:09:00', '2026-10-30 09:09:00', 'doctor', NULL, NULL),
('A-0003', 'P-0002', 'doctor', '2026-10-30', 'Check-up', 'Regular', 'Cancelled', 3, '2026-10-30 08:47:29', NULL, NULL, NULL, NULL, NULL, NULL),
('A-0004', 'P-0004', 'doctor', '2026-10-30', 'X-ray', 'Regular', 'Cancelled', 4, '2026-10-30 08:57:29', NULL, NULL, NULL, NULL, NULL, NULL),
('A-0005', 'P-0002', 'doctor', '2026-10-20', 'Getting Blood', 'Regular', 'Cancelled', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('A-0006', 'P-775800', 'doctor', '2026-10-30', 'Urine Test', 'Regular', 'Completed', 5, '2026-10-30 09:06:06', '2026-10-30 09:09:04', '2026-10-30 09:09:15', '2026-10-30 09:09:15', 'doctor', NULL, NULL),
('A-0007', 'P-0002', 'doctor', '2026-10-30', 'Check-up', 'Regular', 'Completed', 6, '2026-10-30 09:47:30', '2026-10-30 09:57:32', '2026-10-30 09:57:43', '2026-10-30 09:57:43', 'doctor', '2026-10-30 09:54:00', '2026-10-30 09:54:06'),
('A-0008', 'P-0004', 'doctor', '2026-10-30', 'Urine Test', 'Regular', 'Completed', 7, '2026-10-30 09:47:36', '2026-10-30 09:53:47', '2026-10-30 09:54:30', '2026-10-30 09:54:30', 'doctor', NULL, NULL),
('A-0009', 'P-853817', 'doctor', '2026-10-30', 'Getting Urine', 'Regular', 'Completed', 8, '2026-10-30 09:47:40', '2026-10-30 09:58:26', '2026-10-30 09:58:42', '2026-10-30 09:58:42', 'doctor', NULL, NULL),
('A-0010', 'P-0001', 'doctor', '2026-10-30', 'Blood Test', 'Regular', 'Completed', 9, '2026-10-30 10:39:21', '2026-10-30 10:39:50', '2026-10-30 10:40:16', '2026-10-30 10:40:08', 'doctor', NULL, NULL),
('A-0011', 'P-0001', 'doctor', '2026-10-30', 'Getting Urine', 'Regular', 'Completed', 10, '2026-10-30 10:39:38', '2026-10-30 10:48:17', '2026-10-30 10:48:30', '2026-10-30 10:48:30', 'doctor', NULL, NULL),
('A-0012', 'P-0001', 'aikiro', '2026-10-30', 'Getting Blood', 'Regular', 'Completed', 11, '2026-10-30 10:48:02', '2026-10-30 11:00:48', '2026-10-30 11:01:29', '2026-10-30 11:01:29', 'aikiro', NULL, NULL);

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
('A-0012', '180/50', 45, 45.0, 45, 45.0, 45.0, 'admin', '2026-10-30 10:39:46');

--
-- Indexes for dumped tables
--

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
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=299;

--
-- AUTO_INCREMENT for table `prescription_items`
--
ALTER TABLE `prescription_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

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
-- Constraints for table `vitals`
--
ALTER TABLE `vitals`
  ADD CONSTRAINT `vitals_ibfk_1` FOREIGN KEY (`queue_entry_id`) REFERENCES `queue_entries` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
