CREATE TABLE `commerce_inventory` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`sku` text NOT NULL,
	`option_name` text DEFAULT 'Standard' NOT NULL,
	`size` text DEFAULT 'All sizes' NOT NULL,
	`colour` text DEFAULT 'Standard' NOT NULL,
	`stock_on_hand` integer DEFAULT 0 NOT NULL,
	`stock_reserved` integer DEFAULT 0 NOT NULL,
	`reorder_point` integer DEFAULT 4 NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `commerce_products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `commerce_inventory_sku_unique` ON `commerce_inventory` (`sku`);--> statement-breakpoint
CREATE INDEX `commerce_inventory_product_idx` ON `commerce_inventory` (`product_id`);--> statement-breakpoint
CREATE TABLE `commerce_inventory_movements` (
	`id` text PRIMARY KEY NOT NULL,
	`inventory_id` text NOT NULL,
	`movement_type` text NOT NULL,
	`quantity` integer NOT NULL,
	`reference` text,
	`note` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`inventory_id`) REFERENCES `commerce_inventory`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `commerce_inventory_movements_inventory_idx` ON `commerce_inventory_movements` (`inventory_id`);--> statement-breakpoint
CREATE TABLE `commerce_order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`product_id` text,
	`sku` text DEFAULT '' NOT NULL,
	`name` text NOT NULL,
	`quantity` integer NOT NULL,
	`unit_amount` integer NOT NULL,
	`total_amount` integer NOT NULL,
	`specification` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `commerce_orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `commerce_products`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `commerce_order_items_order_idx` ON `commerce_order_items` (`order_id`);--> statement-breakpoint
CREATE TABLE `commerce_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`order_number` text NOT NULL,
	`stripe_session_id` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`payment_status` text DEFAULT 'paid' NOT NULL,
	`fulfilment_status` text DEFAULT 'unfulfilled' NOT NULL,
	`customer_name` text DEFAULT '' NOT NULL,
	`customer_email` text DEFAULT '' NOT NULL,
	`currency` text DEFAULT 'gbp' NOT NULL,
	`subtotal` integer DEFAULT 0 NOT NULL,
	`shipping` integer DEFAULT 0 NOT NULL,
	`tax` integer DEFAULT 0 NOT NULL,
	`total` integer DEFAULT 0 NOT NULL,
	`shipping_address` text DEFAULT '{}' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `commerce_orders_number_unique` ON `commerce_orders` (`order_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `commerce_orders_stripe_unique` ON `commerce_orders` (`stripe_session_id`);--> statement-breakpoint
CREATE INDEX `commerce_orders_created_idx` ON `commerce_orders` (`created_at`);--> statement-breakpoint
CREATE INDEX `commerce_orders_status_idx` ON `commerce_orders` (`status`);--> statement-breakpoint
CREATE TABLE `commerce_products` (
	`id` text PRIMARY KEY NOT NULL,
	`sku` text NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`product_type` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`image` text NOT NULL,
	`price` integer NOT NULL,
	`compare_at_price` integer,
	`cost` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`track_inventory` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `commerce_products_sku_unique` ON `commerce_products` (`sku`);--> statement-breakpoint
CREATE UNIQUE INDEX `commerce_products_slug_unique` ON `commerce_products` (`slug`);--> statement-breakpoint
CREATE INDEX `commerce_products_active_idx` ON `commerce_products` (`active`);--> statement-breakpoint
CREATE INDEX `commerce_products_category_idx` ON `commerce_products` (`category`);--> statement-breakpoint
CREATE TABLE `commerce_questions` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_name` text NOT NULL,
	`customer_email` text NOT NULL,
	`order_number` text,
	`subject` text NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`priority` text DEFAULT 'normal' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `commerce_questions_status_idx` ON `commerce_questions` (`status`);--> statement-breakpoint
CREATE INDEX `commerce_questions_created_idx` ON `commerce_questions` (`created_at`);--> statement-breakpoint
CREATE TABLE `commerce_webhook_events` (
	`id` text PRIMARY KEY NOT NULL,
	`event_type` text NOT NULL,
	`processed_at` text NOT NULL
);
