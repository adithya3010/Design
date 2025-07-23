function calculateChargingTime({
  batteryCapacity,
  currentCharge,
  targetCharge,
  chargingPower,
  includeLoss = true,
  outputUnit = 'minutes'
}) {
  if (
    batteryCapacity <= 0 ||
    currentCharge < 0 || currentCharge > 100 ||
    targetCharge < 0 || targetCharge > 100 ||
    chargingPower <= 0 ||
    currentCharge >= targetCharge
  ) {
    return "Invalid input";
  }

  let effectivePower = includeLoss ? chargingPower * 0.9 : chargingPower;
  let time = 0;

  const fastChargingEnd = Math.min(targetCharge, 80);
  if (currentCharge < fastChargingEnd) {
    const energyNeeded = batteryCapacity * ((fastChargingEnd - currentCharge) / 100);
    time += energyNeeded / effectivePower;
  }

  if (targetCharge > 80) {
    const slowEnergy = batteryCapacity * ((targetCharge - Math.max(currentCharge, 80)) / 100);
    time += slowEnergy / (effectivePower * 0.5);
  }

  return outputUnit === 'minutes' ? parseFloat((time * 60).toFixed(1)) : parseFloat(time.toFixed(2));
}

module.exports = calculateChargingTime;
