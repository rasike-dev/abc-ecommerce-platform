import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { Group, GroupDocument } from '../groups/schemas/group.schema';
import { Carousel, CarouselDocument } from '../carousel/schemas/carousel.schema';

async function verify() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    console.log('\n📊 Database Verification Report\n');
    console.log('═'.repeat(60));

    // Get models
    const userModel = app.get<Model<UserDocument>>('UserModel');
    const productModel = app.get<Model<ProductDocument>>('ProductModel');
    const groupModel = app.get<Model<GroupDocument>>('GroupModel');
    const carouselModel = app.get<Model<CarouselDocument>>('CarouselModel');

    // Count documents
    const userCount = await userModel.countDocuments();
    const productCount = await productModel.countDocuments();
    const groupCount = await groupModel.countDocuments();
    const carouselCount = await carouselModel.countDocuments();

    console.log('\n📈 Collection Statistics:');
    console.log(`   👥 Users:     ${userCount} entries`);
    console.log(`   📚 Groups:    ${groupCount} entries`);
    console.log(`   🎓 Products:  ${productCount} entries`);
    console.log(`   🎨 Carousel:  ${carouselCount} entries`);

    // Sample users
    console.log('\n\n👥 Sample Users:');
    console.log('─'.repeat(60));
    const users = await userModel.find().limit(3).select('name email isAdmin');
    users.forEach((user, idx) => {
      const role = user.isAdmin ? '(Admin)' : '(User)';
      console.log(`   ${idx + 1}. ${user.name} - ${user.email} ${role}`);
    });

    // Sample groups
    console.log('\n\n📚 Sample Groups:');
    console.log('─'.repeat(60));
    const groups = await groupModel.find().limit(3).select('name code subject teacher');
    groups.forEach((group, idx) => {
      console.log(`   ${idx + 1}. ${group.name} (${group.code})`);
      console.log(`      Teacher: ${group.teacher.name}`);
      console.log(`      Subject: ${group.subject}`);
    });

    // Sample products
    console.log('\n\n🎓 Sample Products:');
    console.log('─'.repeat(60));
    const products = await productModel.find().limit(3).select('name price rating numReviews');
    products.forEach((product, idx) => {
      console.log(`   ${idx + 1}. ${product.name}`);
      console.log(`      Price: ₹${product.price.toLocaleString()}`);
      console.log(`      Rating: ${product.rating.toFixed(1)}⭐ (${product.numReviews} reviews)`);
    });

    // Sample carousel
    console.log('\n\n🎨 Sample Carousel Items:');
    console.log('─'.repeat(60));
    const carousel = await carouselModel.find().limit(3).select('name description');
    carousel.forEach((item, idx) => {
      console.log(`   ${idx + 1}. ${item.name}`);
      console.log(`      ${item.description.substring(0, 50)}...`);
    });

    // Relationship checks
    console.log('\n\n🔗 Relationship Verification:');
    console.log('─'.repeat(60));
    
    const productsWithReviews = await productModel.find({ 'reviews.0': { $exists: true } });
    const totalReviews = productsWithReviews.reduce((sum, p) => sum + p.reviews.length, 0);
    console.log(`   ✓ Products with reviews: ${productsWithReviews.length}/${productCount}`);
    console.log(`   ✓ Total reviews: ${totalReviews}`);
    
    const groupsWithTeachers = await groupModel.find({ 'teacher.user': { $exists: true } });
    console.log(`   ✓ Groups with teacher references: ${groupsWithTeachers.length}/${groupCount}`);
    
    const adminUsers = await userModel.find({ isAdmin: true });
    console.log(`   ✓ Admin users: ${adminUsers.length}`);

    console.log('\n' + '═'.repeat(60));
    console.log('\n✅ Verification completed successfully!\n');
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

verify();

