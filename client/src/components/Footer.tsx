import { motion } from "framer-motion";

const Footer = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center py-4 text-gray-400 text-sm border-t border-gray-800 mt-24"
    >
      <p>Copyright &copy; 2025 Website Builder. All rights reserved.</p>
    </motion.div>
  );
};

export default Footer;
